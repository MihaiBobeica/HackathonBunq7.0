from __future__ import annotations

import logging
from typing import Annotated

from fastapi import FastAPI, File, Form, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware

import bunq_client
from config import settings
from llm_content_handler import LlmContentHandler
from payment_handler import PaymentHandler
from schemas import (
    AccountsResponse,
    AnalyzeResponse,
    DraftPaymentRequest,
    DraftPaymentResponse,
    IbanCheckResponse,
    PaymentRequest,
    PaymentResponse,
    TransactionsResponse,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("warden")

app = FastAPI(title="Warden Backend", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:5173", "http://127.0.0.1:5173",
        "http://localhost:5174", "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_payments = PaymentHandler()
_llm = LlmContentHandler()


@app.on_event("startup")
def _startup() -> None:
    bunq_client.init_bunq_context()


@app.get("/api/health")
def health() -> dict:
    return {
        "ok": True,
        "bunq_ready": bunq_client.is_ready(),
        "bunq_error": bunq_client.last_error(),
        "model": settings.anthropic_model,
        "frontend_origin": settings.frontend_origin,
    }


# --- Accounts / transactions / iban ---
@app.get("/api/accounts", response_model=AccountsResponse)
def get_accounts() -> AccountsResponse:
    return _payments.list_accounts()


@app.get("/api/transactions", response_model=TransactionsResponse)
def get_transactions(
    account_id: int | None = Query(default=None),
    limit: int = Query(default=10, ge=1, le=50),
) -> TransactionsResponse:
    return _payments.list_transactions(account_id=account_id, limit=limit)


@app.get("/api/iban-check", response_model=IbanCheckResponse)
def get_iban_check(
    iban: str = Query(...),
    amount: float | None = Query(default=None),
) -> IbanCheckResponse:
    return _payments.iban_check(iban=iban, amount=amount)


# --- Draft payment ---
@app.post("/api/draft-payment", response_model=DraftPaymentResponse)
def post_draft_payment(body: DraftPaymentRequest) -> DraftPaymentResponse:
    return _payments.create_draft_payment(body)


# --- Analyze (multimodal) ---
@app.post("/api/analyze", response_model=AnalyzeResponse)
async def post_analyze(
    text: Annotated[str, Form()] = "",
    iban: Annotated[str, Form()] = "",
    amount: Annotated[str, Form()] = "",
    description: Annotated[str, Form()] = "",
    files: Annotated[list[UploadFile] | None, File()] = None,
) -> AnalyzeResponse:
    return await _llm.analyze(text=text, uploads=files, iban=iban, amount=amount, description=description)


# --- Webhook stub (stretch) ---
@app.post("/api/bunq-webhook")
async def post_bunq_webhook(payload: dict) -> dict:
    log.info("bunq webhook: %s", payload)
    return {"ok": True}


# --- Legacy endpoints (kept for backwards compat) ---
@app.post("/payment", response_model=PaymentResponse)
def perform_payment(body: PaymentRequest) -> PaymentResponse:
    return _payments.pay_request(body)


@app.post("/scam-check")
async def check_scam(
    text: Annotated[str, Form()] = "",
    files: Annotated[list[UploadFile] | None, File()] = None,
):
    return await _llm.handle_scam_check(text, files)
