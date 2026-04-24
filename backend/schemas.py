from __future__ import annotations

from pydantic import BaseModel


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
