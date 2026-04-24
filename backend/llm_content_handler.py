from __future__ import annotations

import re
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import UploadFile


class LlmContentHandler:
    HIGH_RISK_PATTERNS = (
        ("new number", "The sender claims to be using a new phone number."),
        ("don't call", "The message discourages normal voice verification."),
        ("do not call", "The message discourages normal voice verification."),
        ("urgent", "The message creates urgency around the transfer."),
        ("safe account", "The message mentions a fake safety or holding account."),
        ("security account", "The message mentions a fake safety or holding account."),
        ("changed iban", "The message claims the payment account changed."),
        ("new iban", "The message claims the payment account changed."),
        ("deposit", "The message pressures for a deposit before verification."),
        ("crypto", "The message references crypto or investment pressure."),
        ("do not contact", "The message discourages contacting a trusted channel."),
        ("stay on the call", "The message pressures the user to remain on a call."),
    )
    LOW_RISK_PATTERNS = ("groceries", "grocery", "no rush", "whenever", "same iban", "dinner")

    async def handle_scam_check(
        self, text: str, uploads: list[UploadFile] | None
    ) -> dict:
        clean_text = (text or "").strip()
        lower_text = clean_text.lower()
        upload_summaries = await self._summarize_uploads(uploads or [])
        matched_signals = self._matched_signals(lower_text)
        detected_ibans = re.findall(r"\b[A-Z]{2}\d{2}[A-Z0-9 ]{8,30}\b", clean_text.upper())
        detected_amount = self._extract_amount(clean_text)

        if matched_signals:
            return self._high_risk_verdict(
                matched_signals=matched_signals,
                detected_ibans=detected_ibans,
                detected_amount=detected_amount,
                upload_summaries=upload_summaries,
            )

        if clean_text and self._looks_low_risk(lower_text):
            return self._low_risk_verdict(
                upload_summaries=upload_summaries,
                detail="The pasted text looks like a familiar low-pressure payment request in the demo playbook.",
                confidence="medium",
            )

        if clean_text:
            return self._medium_risk_verdict(
                detected_ibans=detected_ibans,
                detected_amount=detected_amount,
                upload_summaries=upload_summaries,
            )

        return self._low_risk_verdict(upload_summaries=upload_summaries)

    async def _summarize_uploads(self, uploads: list[UploadFile]) -> list[dict]:
        summaries = []
        for upload in uploads:
            contents = await upload.read()
            await upload.seek(0)
            summaries.append(
                {
                    "filename": upload.filename,
                    "content_type": upload.content_type,
                    "size_bytes": len(contents),
                }
            )
        return summaries

    def _matched_signals(self, lower_text: str) -> list[dict]:
        return [
            {"phrase": phrase, "detail": detail}
            for phrase, detail in self.HIGH_RISK_PATTERNS
            if phrase in lower_text
        ]

    def _extract_amount(self, text: str) -> float | None:
        match = re.search(r"(?:eur|€)\s*([0-9]+(?:[,.][0-9]{1,2})?)", text, re.IGNORECASE)
        if not match:
            return None
        return float(match.group(1).replace(",", "."))

    def _looks_low_risk(self, lower_text: str) -> bool:
        return any(pattern in lower_text for pattern in self.LOW_RISK_PATTERNS)

    def _high_risk_verdict(
        self,
        matched_signals: list[dict],
        detected_ibans: list[str],
        detected_amount: float | None,
        upload_summaries: list[dict],
    ) -> dict:
        score = min(96, 78 + len(matched_signals) * 4)
        reasons = [
            {
                "dimension": "linguistic",
                "signal": signal["phrase"].replace(" ", "_"),
                "headline": "Suspicious pressure language",
                "detail": signal["detail"],
                "severity": "high",
            }
            for signal in matched_signals[:4]
        ]

        if upload_summaries:
            reasons.append(
                {
                    "dimension": "document",
                    "signal": "upload_received",
                    "headline": "Evidence attached",
                    "detail": f"{len(upload_summaries)} uploaded file(s) reached the backend. Claude document parsing will inspect file contents in the next phase.",
                    "severity": "medium",
                }
            )

        return {
            "risk_level": "high",
            "risk_score": score,
            "scam_type": self._infer_scam_type(matched_signals),
            "confidence": "high",
            "headline": "This looks like a scam pattern. Verify before sending.",
            "reasons": reasons,
            "safe_actions": [
                {
                    "action_id": "delay_payment",
                    "label": "Pause payment",
                    "rationale": "Scammers rely on urgency; pausing removes their strongest advantage.",
                },
                {
                    "action_id": "call_saved_contact",
                    "label": "Call trusted contact",
                    "rationale": "Verify through a saved number or official channel, not the one in the message.",
                },
            ],
            "detected_entities": {
                "iban": detected_ibans[0] if detected_ibans else None,
                "amount_eur": detected_amount,
                "claimed_identity": None,
                "urgency_signals": [signal["phrase"] for signal in matched_signals],
                "merchant_name": None,
            },
            "received_files": upload_summaries,
            "context_match": {
                "matched_recent_upload": bool(upload_summaries),
                "match_description": "File contents are not parsed until the Claude phase.",
            },
        }

    def _medium_risk_verdict(
        self,
        detected_ibans: list[str],
        detected_amount: float | None,
        upload_summaries: list[dict],
    ) -> dict:
        return {
            "risk_level": "medium",
            "risk_score": 45,
            "scam_type": "unclear",
            "confidence": "medium",
            "headline": "Some context is present, but no strong scam phrase matched.",
            "reasons": [
                {
                    "dimension": "contextual",
                    "signal": "manual_review",
                    "headline": "Context needs review",
                    "detail": "The pasted text does not match the demo scam playbook strongly. Verify the recipient details before sending.",
                    "severity": "medium",
                }
            ],
            "safe_actions": [
                {
                    "action_id": "verify_iban",
                    "label": "Verify IBAN",
                    "rationale": "Confirm the IBAN through a separate trusted channel.",
                },
                {
                    "action_id": "proceed_with_caution",
                    "label": "Proceed carefully",
                    "rationale": "No strong red flags were detected by the mock scanner.",
                },
            ],
            "detected_entities": {
                "iban": detected_ibans[0] if detected_ibans else None,
                "amount_eur": detected_amount,
                "claimed_identity": None,
                "urgency_signals": [],
                "merchant_name": None,
            },
            "received_files": upload_summaries,
            "context_match": {
                "matched_recent_upload": bool(upload_summaries),
                "match_description": "File contents are not parsed until the Claude phase.",
            },
        }

    def _low_risk_verdict(
        self,
        upload_summaries: list[dict],
        detail: str | None = None,
        confidence: str | None = None,
    ) -> dict:
        detail = detail or "No pasted text was provided, so the mock scanner found no suspicious language."
        if upload_summaries:
            detail = f"{len(upload_summaries)} file(s) were received, but file content parsing is reserved for the Claude integration phase."

        return {
            "risk_level": "low",
            "risk_score": 12 if not upload_summaries else 18,
            "scam_type": "none",
            "confidence": confidence or ("low" if upload_summaries else "medium"),
            "headline": "No suspicious text detected by the mock scanner.",
            "reasons": [
                {
                    "dimension": "linguistic",
                    "signal": "no_match",
                    "headline": "No scam phrase matched",
                    "detail": detail,
                    "severity": "low",
                }
            ],
            "safe_actions": [
                {
                    "action_id": "proceed_with_caution",
                    "label": "Continue carefully",
                    "rationale": "The mock scanner found no suspicious pasted text, but this is not a final fraud guarantee.",
                }
            ],
            "detected_entities": {
                "iban": None,
                "amount_eur": None,
                "claimed_identity": None,
                "urgency_signals": [],
                "merchant_name": None,
            },
            "received_files": upload_summaries,
            "context_match": {
                "matched_recent_upload": bool(upload_summaries),
                "match_description": "File contents are not parsed until the Claude phase.",
            },
        }

    def _infer_scam_type(self, matched_signals: list[dict]) -> str:
        phrases = {signal["phrase"] for signal in matched_signals}
        if "new number" in phrases or "don't call" in phrases or "do not call" in phrases:
            return "impersonation"
        if "changed iban" in phrases or "new iban" in phrases:
            return "fake_invoice"
        if "crypto" in phrases:
            return "urgency_pressure"
        if "safe account" in phrases or "security account" in phrases:
            return "impersonation"
        return "urgency_pressure"
