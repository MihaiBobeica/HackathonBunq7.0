from __future__ import annotations

import io
import logging
from dataclasses import dataclass, field
from typing import Iterable

from fastapi import UploadFile

log = logging.getLogger(__name__)

_DOCX_TYPES = {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}
_PDF_TYPES = {"application/pdf"}
_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}


@dataclass
class ParsedUploads:
    images: list[tuple[bytes, str]] = field(default_factory=list)
    pdfs: list[bytes] = field(default_factory=list)
    docx_texts: list[str] = field(default_factory=list)
    skipped: list[str] = field(default_factory=list)


async def parse_uploads(uploads: Iterable[UploadFile] | None) -> ParsedUploads:
    out = ParsedUploads()
    if not uploads:
        return out

    for f in uploads:
        try:
            data = await f.read()
        except Exception as e:
            log.warning("failed to read upload %s: %s", f.filename, e)
            out.skipped.append(f.filename or "<unnamed>")
            continue

        ctype = (f.content_type or "").lower()
        name = (f.filename or "").lower()

        if ctype in _IMAGE_TYPES or name.endswith((".jpg", ".jpeg", ".png", ".gif", ".webp")):
            media = ctype if ctype in _IMAGE_TYPES else _guess_image_media(name)
            out.images.append((data, media))
        elif ctype in _PDF_TYPES or name.endswith(".pdf"):
            out.pdfs.append(data)
        elif ctype in _DOCX_TYPES or name.endswith(".docx"):
            text = _extract_docx_text(data)
            if text:
                out.docx_texts.append(text)
            else:
                out.skipped.append(f.filename or "<docx>")
        else:
            out.skipped.append(f"{f.filename}({ctype})")

    return out


def _guess_image_media(name: str) -> str:
    if name.endswith(".png"):
        return "image/png"
    if name.endswith(".gif"):
        return "image/gif"
    if name.endswith(".webp"):
        return "image/webp"
    return "image/jpeg"


def _extract_docx_text(data: bytes) -> str:
    try:
        from docx import Document
    except ImportError:
        log.warning("python-docx not installed; skipping DOCX")
        return ""
    try:
        doc = Document(io.BytesIO(data))
        return "\n".join(p.text for p in doc.paragraphs if p.text)
    except Exception as e:
        log.warning("docx extract failed: %s", e)
        return ""
