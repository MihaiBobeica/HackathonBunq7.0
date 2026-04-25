from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel


# Existing
class PaymentRequest(BaseModel):
    amount: float
    currency: str
    recipient: str
    description: str | None = None


class PaymentResponse(BaseModel):
    status: str
    payment_id: str
    amount: float
    currency: str
    recipient: str
    message: str


# Accounts
class AccountOut(BaseModel):
    id: int
    label: str
    sub: str
    amount: str


class AccountsResponse(BaseModel):
    accounts: list[AccountOut]
    fallback: bool = False


# Transactions
class TransactionOut(BaseModel):
    id: int
    name: str
    cat: str
    amount: str


class TransactionsResponse(BaseModel):
    transactions: list[TransactionOut]
    fallback: bool = False


# IBAN check
class IbanSignals(BaseModel):
    new_beneficiary: bool
    high_amount: bool
    first_seen: Optional[str] = None
    payment_count: int = 0


class IbanCheckResponse(BaseModel):
    flagged: bool
    reason: str
    signals: IbanSignals


# Analyze
RiskLevel = Literal["low", "medium", "high", "critical"]


class AnalyzeResponse(BaseModel):
    score: int
    level: RiskLevel
    reasons: list[str]
    recommendation: str
    fallback: bool = False


# Draft payment
class DraftPaymentRequest(BaseModel):
    iban: str
    amount: str
    description: str = ""
    counterparty_name: str = "Recipient"


class DraftPaymentResponse(BaseModel):
    draft_id: Optional[int] = None
    status: str
    message: str
