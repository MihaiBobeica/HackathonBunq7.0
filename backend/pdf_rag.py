from __future__ import annotations

import io
import re
from typing import Sequence

from pypdf import PdfReader
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def _chunk_text(text: str, chunk_size: int = 1000, overlap: int = 150) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    chunks: list[str] = []
    i = 0
    while i < len(text):
        end = min(i + chunk_size, len(text))
        piece = text[i:end].strip()
        if piece:
            chunks.append(piece)
        if end >= len(text):
            break
        i = end - overlap
        if i < 0:
            i = end
    return chunks


def extract_pdf_chunks(pdf_bytes: bytes) -> list[str]:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    parts: list[str] = []
    for page in reader.pages:
        try:
            t = page.extract_text() or ""
        except Exception:
            t = ""
        if t.strip():
            parts.append(t)
    full = "\n".join(parts)
    return _chunk_text(full)


def retrieve_top_chunks(
    chunks: Sequence[str],
    query: str,
    top_k: int = 5,
) -> list[str]:
    if not chunks:
        return []
    if not query.strip():
        return list(chunks[:top_k])
    vec = TfidfVectorizer(max_features=4096, ngram_range=(1, 2))
    try:
        mat = vec.fit_transform(list(chunks))
        q = vec.transform([query])
        sims = cosine_similarity(q, mat).ravel()
    except ValueError:
        return list(chunks[:top_k])
    idx = sims.argsort()[::-1][:top_k]
    seen: set[int] = set()
    out: list[str] = []
    for i in idx:
        if i in seen:
            continue
        seen.add(int(i))
        out.append(chunks[int(i)])
    return out
