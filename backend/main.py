from __future__ import annotations

from typing import Annotated

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from llm_content_handler import LlmContentHandler
from payment_handler import PaymentHandler
from schemas import PaymentRequest, PaymentResponse

app = FastAPI(title="Hackathon Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_payments = PaymentHandler()
_llm_content = LlmContentHandler()


@app.post("/payment", response_model=PaymentResponse)
def perform_payment(body: PaymentRequest) -> PaymentResponse:
    return _payments.pay_request(body)


@app.post("/scam-check")
async def check_scam(
    text: Annotated[str, Form()] = "",
    files: Annotated[list[UploadFile] | None, File()] = None,
):
    return await _llm_content.handle_scam_check(text, files)
