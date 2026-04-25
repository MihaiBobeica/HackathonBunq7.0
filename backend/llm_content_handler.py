from __future__ import annotations

import base64
import json
import logging
import re
from typing import Optional

from fastapi import UploadFile

from config import settings
from parsers import ParsedUploads, parse_uploads
from schemas import AnalyzeResponse

log = logging.getLogger(__name__)

_SYSTEM_PROMPT = (
    "You are Warden, bunq's fraud-analyst AI. Your job is to analyze payment "
    "context — images, documents, chat messages, invoices — and detect signs "
    "of scams targeting bunq users (authorized push payment fraud, "
    "invoice-tampering, social-engineering). You respond with structured JSON "
    "only, no prose outside the JSON."
)

_JSON_BLOCK = re.compile(r"```(?:json)?\s*(\{.*?\})\s*```", re.DOTALL)


class LlmContentHandler:
    async def handle_scam_check(
        self, text: str, uploads: list[UploadFile] | None
    ) -> dict:
        # Legacy endpoint shape — delegate to analyze with empty payment context
        result = await self.analyze(text=text, uploads=uploads, iban="", amount="", description="")
        return result.model_dump()

    async def analyze(
        self,
        text: str,
        uploads: list[UploadFile] | None,
        iban: str,
        amount: str,
        description: str,
    ) -> AnalyzeResponse:
        if not settings.anthropic_api_key:
            return _fallback("ANTHROPIC_API_KEY not set; returning heuristic result")

        parsed = await parse_uploads(uploads)

        try:
            from anthropic import Anthropic
        except ImportError:
            return _fallback("anthropic SDK not installed")

        content = _build_content(parsed, text, iban, amount, description)

        try:
            client = Anthropic(api_key=settings.anthropic_api_key)
            resp = client.messages.create(
                model=settings.anthropic_model,
                max_tokens=1024,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": content}],
            )
        except Exception as e:
            log.exception("anthropic call failed")
            return _fallback(f"Analysis service error: {e}")

        raw = ""
        for block in resp.content:
            if getattr(block, "type", None) == "text":
                raw += block.text

        parsed_json = _parse_json(raw)
        if not parsed_json:
            return _fallback("Model returned non-JSON output")

        return _coerce(parsed_json)


def _build_content(
    parsed: ParsedUploads,
    text: str,
    iban: str,
    amount: str,
    description: str,
) -> list[dict]:
    content: list[dict] = []

    for img_bytes, media in parsed.images:
        content.append({
            "type": "image",
            "source": {
                "type": "base64",
                "media_type": media,
                "data": base64.b64encode(img_bytes).decode("utf-8"),
            },
        })

    for pdf_bytes in parsed.pdfs:
        content.append({
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": base64.b64encode(pdf_bytes).decode("utf-8"),
            },
        })

    text_parts: list[str] = []
    if parsed.docx_texts:
        text_parts.append("Extracted document text:\n" + "\n---\n".join(parsed.docx_texts))
    if text:
        text_parts.append("User-pasted context:\n" + text)
    text_parts.append(
        f"""Payment context:
- Recipient IBAN: {iban or '(not provided)'}
- Amount: {amount or '(not provided)'}
- Description: {description or '(not provided)'}

Task: Assess whether this payment shows signs of an authorized push payment (APP) fraud, invoice-tampering scam, or social-engineering scam. Respond ONLY with valid JSON matching this schema:

{{
  "score": <integer 0-100, higher = riskier>,
  "level": "<low|medium|high|critical>",
  "reasons": [<3-5 concise strings explaining the findings>],
  "recommendation": "<one sentence: proceed / delay / stop>"
}}"""
    )
    content.append({"type": "text", "text": "\n\n".join(text_parts)})
    return content


def _parse_json(raw: str) -> Optional[dict]:
    if not raw:
        return None
    raw = raw.strip()
    m = _JSON_BLOCK.search(raw)
    candidate = m.group(1) if m else raw
    candidate = candidate.strip().strip("`")
    try:
        return json.loads(candidate)
    except Exception:
        # Last-ditch: find first { ... last }
        start, end = candidate.find("{"), candidate.rfind("}")
        if start != -1 and end > start:
            try:
                return json.loads(candidate[start : end + 1])
            except Exception:
                return None
    return None


def _coerce(d: dict) -> AnalyzeResponse:
    score = int(d.get("score", 50))
    score = max(0, min(100, score))
    level = str(d.get("level", "medium")).lower()
    if level not in {"low", "medium", "high", "critical"}:
        level = "medium"
    reasons = d.get("reasons") or []
    if not isinstance(reasons, list):
        reasons = [str(reasons)]
    reasons = [str(r) for r in reasons][:6]
    recommendation = str(d.get("recommendation") or "Review before continuing.")
    return AnalyzeResponse(
        score=score,
        level=level,  # type: ignore[arg-type]
        reasons=reasons,
        recommendation=recommendation,
        fallback=False,
    )


def _fallback(reason: str) -> AnalyzeResponse:
    log.warning("analyze fallback: %s", reason)
    return AnalyzeResponse(
        score=65,
        level="medium",
        reasons=[
            "Analysis service unavailable — using cached heuristic result.",
            reason,
        ],
        recommendation="Review the payment manually before continuing.",
        fallback=True,
    )
