from __future__ import annotations

import logging
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import bunq_client
from cancellable_assist_handler import CancellableAssistHandler
from schemas import (
    BunqAccount,
    BunqCard,
    BunqPayment,
    CancellableAssistResponse,
    CreatePaymentRequest,
    CreatePaymentResponse,
)

load_dotenv(override=True)

logger = logging.getLogger("bunq-sentinel")
logging.basicConfig(level=logging.INFO)

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


@app.get("/")
def root() -> dict:
    return {
        "service": "bunq-sentinel-backend",
        "bunq_configured": bunq_client.is_configured(),
        "docs": "/docs",
        "endpoints": [
            "/bunq/status",
            "/bunq/accounts",
            "/bunq/accounts/{account_id}/payments",
            "/bunq/cards",
            "/bunq/payments (POST)",
            "/bunq/accounts/{account_id}/sandbox-fund (POST)",
            "/cancellable-assist (POST)",
        ],
    }


@app.post("/cancellable-assist", response_model=CancellableAssistResponse)
async def cancellable_assist(
    text: Annotated[str, Form()] = "",
    mode: Annotated[str, Form()] = "flagged",
    files: Annotated[list[UploadFile] | None, File()] = None,
) -> CancellableAssistResponse:
    return await _cancellable.handle(text, files, mode)


# --------------------------- bunq endpoints ---------------------------

def _bunq_call(fn, *args, **kwargs):
    if not bunq_client.is_configured():
        raise HTTPException(status_code=503, detail="BUNQ_API_KEY is not configured on the server.")
    try:
        return fn(*args, **kwargs)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("bunq SDK call failed")
        raise HTTPException(status_code=502, detail=f"bunq API error: {exc}") from exc


@app.get("/bunq/status")
def bunq_status() -> dict:
    return {"configured": bunq_client.is_configured()}


@app.get("/bunq/accounts", response_model=list[BunqAccount])
def bunq_accounts() -> list[BunqAccount]:
    accounts = _bunq_call(bunq_client.list_accounts)
    return [BunqAccount(**a) for a in accounts]


@app.get("/bunq/accounts/{account_id}/payments", response_model=list[BunqPayment])
def bunq_payments(account_id: int, count: int = 25) -> list[BunqPayment]:
    payments = _bunq_call(bunq_client.list_payments, account_id, count)
    return [BunqPayment(**p) for p in payments]


@app.get("/bunq/cards", response_model=list[BunqCard])
def bunq_cards() -> list[BunqCard]:
    cards = _bunq_call(bunq_client.list_cards)
    return [BunqCard(**c) for c in cards]


@app.post("/bunq/payments", response_model=CreatePaymentResponse)
def bunq_create_payment(req: CreatePaymentRequest) -> CreatePaymentResponse:
    if req.draft:
        payment_id = _bunq_call(
            bunq_client.create_draft_payment,
            req.monetary_account_id,
            req.amount,
            req.currency,
            req.counterparty_iban,
            req.counterparty_name,
            req.description,
        )
    else:
        payment_id = _bunq_call(
            bunq_client.create_payment,
            req.monetary_account_id,
            req.amount,
            req.currency,
            req.counterparty_iban,
            req.counterparty_name,
            req.description,
        )
    return CreatePaymentResponse(id=payment_id, draft=req.draft)


@app.post("/bunq/accounts/{account_id}/draft-payments/{draft_id}/cancel")
def bunq_cancel_draft(account_id: int, draft_id: int) -> dict:
    _bunq_call(bunq_client.cancel_draft_payment, account_id, draft_id)
    return {"cancelled": True}


@app.post("/bunq/accounts/{account_id}/sandbox-fund")
def bunq_sandbox_fund(account_id: int, amount: str = "500.00") -> dict:
    request_id = _bunq_call(bunq_client.fund_sandbox_account, account_id, amount)
    return {"request_inquiry_id": request_id, "amount": amount}
