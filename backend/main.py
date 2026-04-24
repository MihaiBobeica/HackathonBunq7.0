from __future__ import annotations

from typing import Annotated

from fastapi import FastAPI, File, Form, UploadFile

from llm_content_handler import LlmContentHandler
from payment_handler import PaymentHandler
from schemas import PaymentRequest, PaymentResponse

app = FastAPI(title="Hackathon Backend", version="0.1.0")

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
