from __future__ import annotations

from typing import Annotated

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from cancellable_assist_handler import CancellableAssistHandler
from schemas import CancellableAssistResponse

load_dotenv(override=True)

app = FastAPI(title="Hackathon Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_cancellable = CancellableAssistHandler()


@app.post("/cancellable-assist", response_model=CancellableAssistResponse)
async def cancellable_assist(
    text: Annotated[str, Form()] = "",
    files: Annotated[list[UploadFile] | None, File()] = None,
) -> CancellableAssistResponse:
    return await _cancellable.handle(text, files)
