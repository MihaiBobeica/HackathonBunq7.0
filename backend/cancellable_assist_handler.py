from __future__ import annotations

import base64
import json
import os
from typing import Any

from anthropic import Anthropic
from anthropic import APIError
from fastapi import HTTPException, UploadFile

from pdf_rag import extract_pdf_chunks, retrieve_top_chunks
from schemas import CancellableAssistResponse, FraudOutcome, RiskFactor

# Limits (documented here for operators)
MAX_FILES = 12
MAX_TOTAL_UPLOAD_BYTES = 15 * 1024 * 1024
MAX_SINGLE_FILE_BYTES = 8 * 1024 * 1024

JPEG_MAGIC = (b"\xff\xd8\xff", "image/jpeg")
PNG_MAGIC = (b"\x89PNG\r\n\x1a\n", "image/png")
PDF_MAGIC = (b"%PDF", "application/pdf")

DEFAULT_MODEL = "claude-sonnet-4-5-20250929"

SYSTEM_PROMPT = """You are a concise financial fraud reviewer.
Return one of two outcomes:
1. no_strong_scam_presence: evidence does not show strong scam presence. Do not say it is guaranteed safe.
2. scam_identified: identify the scam type, exactly 3 short reasons, risk factor, and recommend the safest next action.
Keep every text field short: one sentence max. Reasons must be brief fragments. No legal advice. Use submit_assessment exactly once."""

TOOLS: list[dict[str, Any]] = [
    {
        "name": "submit_assessment",
        "description": "Structured fraud-safety assessment for the user.",
        "input_schema": {
            "type": "object",
            "properties": {
                "outcome": {
                    "type": "string",
                    "enum": ["no_strong_scam_presence", "scam_identified"],
                    "description": "Whether strong scam presence was found.",
                },
                "scam_type": {
                    "type": "string",
                    "description": "Required for scam_identified; short label such as Marketplace scam, Invoice scam, Bank impersonation scam. Empty string otherwise.",
                },
                "reasons": {
                    "type": "array",
                    "items": {"type": "string"},
                    "minItems": 3,
                    "maxItems": 3,
                    "description": "Exactly 3 short reasons for scam_identified. For no_strong_scam_presence, use three short caution notes if useful.",
                },
                "risk_factor": {
                    "type": "string",
                    "enum": ["Low", "Medium", "High"],
                    "description": "Risk level based on available evidence.",
                },
                "summary": {
                    "type": "string",
                    "description": "One short sentence for the UI.",
                },
                "recommended_action": {
                    "type": "string",
                    "description": "One short sentence. For flagged payments, recommend canceling or contacting the bank. For self-checks, recommend not paying or verifying through a trusted channel.",
                },
            },
            "required": [
                "outcome",
                "scam_type",
                "reasons",
                "risk_factor",
                "summary",
                "recommended_action",
            ],
        },
    }
]


def _sniff_kind(raw: bytes) -> tuple[str, str] | None:
    if len(raw) < 8:
        return None
    if raw.startswith(JPEG_MAGIC[0]):
        return "jpeg", JPEG_MAGIC[1]
    if raw.startswith(PNG_MAGIC[0]):
        return "png", PNG_MAGIC[1]
    if raw.startswith(PDF_MAGIC[0]):
        return "pdf", PDF_MAGIC[1]
    return None


def _fallback_response() -> CancellableAssistResponse:
    return CancellableAssistResponse(
        outcome=FraudOutcome.no_strong_scam_presence,
        scam_type=None,
        reasons=[],
        risk_factor=RiskFactor.medium,
        summary="No strong scam presence can be confirmed from the available evidence.",
        recommended_action="Proceed cautiously and contact support if anything feels wrong.",
    )


class CancellableAssistHandler:
    async def handle(
        self,
        text: str,
        files: list[UploadFile] | None,
        mode: str = "flagged",
    ) -> CancellableAssistResponse:
        api_key = os.environ.get("ANTHROPIC_API_KEY", "").strip()
        if not api_key:
            raise HTTPException(
                status_code=503,
                detail="ANTHROPIC_API_KEY is not configured on the server.",
            )

        total = 0
        if files is None:
            uploads = []
        elif isinstance(files, list):
            uploads = list(files)
        else:
            uploads = [files]
        if len(uploads) > MAX_FILES:
            raise HTTPException(
                status_code=400,
                detail=f"At most {MAX_FILES} files are allowed.",
            )

        pdf_chunks_all: list[str] = []
        image_blocks: list[dict[str, Any]] = []

        for uf in uploads:
            data = await uf.read()
            if len(data) > MAX_SINGLE_FILE_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail=f"File exceeds maximum size ({MAX_SINGLE_FILE_BYTES // (1024 * 1024)} MB).",
                )
            total += len(data)
            if total > MAX_TOTAL_UPLOAD_BYTES:
                raise HTTPException(
                    status_code=400,
                    detail="Total upload size exceeds the allowed limit.",
                )
            sniff = _sniff_kind(data)
            if sniff is None:
                raise HTTPException(
                    status_code=400,
                    detail="Only JPEG, PNG, and PDF files are supported.",
                )
            kind, declared_mime = sniff
            ct = (uf.content_type or "").lower().split(";")[0].strip()
            allowed_ct = {
                "jpeg": {"image/jpeg"},
                "png": {"image/png"},
                "pdf": {"application/pdf"},
            }[kind]
            if ct and ct != "application/octet-stream" and ct not in allowed_ct:
                raise HTTPException(
                    status_code=400,
                    detail=f"Content-Type {ct!r} does not match allowed types for {kind.upper()}.",
                )
            if kind == "pdf":
                try:
                    pdf_chunks_all.extend(extract_pdf_chunks(data))
                except Exception as exc:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Could not read PDF: {exc}",
                    ) from exc
            else:
                b64 = base64.standard_b64encode(data).decode("ascii")
                image_blocks.append(
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": declared_mime,
                            "data": b64,
                        },
                    }
                )

        normalized_mode = "self" if mode == "self" else "flagged"
        if normalized_mode == "flagged":
            scenario = (
                "Scenario: outbound payment was already made, bunqAI flagged it, "
                "and the payment is still revocable within the safety window. "
                "Recipient IBAN: NL99 BUNQ 0123 4567 89. "
                "Transaction context: marketplace deposit, unknown beneficiary."
            )
        else:
            scenario = (
                "Scenario: user is proactively checking suspicious payment instructions before acting. "
                "No bank payment has to exist. Analyze messages, screenshots, emails, invoices, or PDFs for fraud signals."
            )

        query_for_rag = f"{text}\n\n{scenario}"
        retrieved = retrieve_top_chunks(pdf_chunks_all, query_for_rag, top_k=5)
        rag_section = ""
        if retrieved:
            rag_section = "\n\n--- Retrieved excerpts from uploaded PDFs (may be incomplete) ---\n"
            for i, c in enumerate(retrieved, 1):
                rag_section += f"\n[Excerpt {i}]\n{c}\n"

        user_narrative = text.strip() or "(No additional message from the user.)"

        text_block = (
            f"{scenario}\n\n"
            f"User description / context:\n{user_narrative}\n"
            f"{rag_section}\n"
            "Analyze screenshots (if any) and text. Keep the result concise. Call submit_assessment once."
        )

        content: list[dict[str, Any]] = [{"type": "text", "text": text_block}]
        content.extend(image_blocks)

        model = os.environ.get("ANTHROPIC_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
        client = Anthropic(api_key=api_key)
        try:
            message = client.messages.create(
                model=model,
                max_tokens=500,
                system=SYSTEM_PROMPT,
                tools=TOOLS,
                tool_choice={"type": "tool", "name": "submit_assessment"},
                messages=[{"role": "user", "content": content}],
            )
        except APIError as exc:
            raise HTTPException(
                status_code=502,
                detail=f"Anthropic API error: {exc}",
            ) from exc

        parsed = _parse_tool_assessment(message)
        if parsed is not None:
            return parsed

        # Fallback: try raw text JSON
        for block in message.content:
            if hasattr(block, "text") and block.text:
                try:
                    start = block.text.find("{")
                    end = block.text.rfind("}") + 1
                    if start >= 0 and end > start:
                        obj = json.loads(block.text[start:end])
                        return CancellableAssistResponse.model_validate(obj)
                except (json.JSONDecodeError, ValueError):
                    continue

        return _fallback_response()


def _parse_tool_assessment(message: Any) -> CancellableAssistResponse | None:
    for block in message.content:
        if getattr(block, "type", None) == "tool_use" and getattr(block, "name", "") == "submit_assessment":
            inp = getattr(block, "input", None)
            if isinstance(inp, dict):
                try:
                    return CancellableAssistResponse.model_validate(inp)
                except Exception:
                    return None
    return None
