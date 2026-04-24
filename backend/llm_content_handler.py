from __future__ import annotations

from fastapi import UploadFile


class LlmContentHandler:
    async def handle_scam_check(
        self, text: str, uploads: list[UploadFile] | None
    ) -> dict:
        raise NotImplementedError
