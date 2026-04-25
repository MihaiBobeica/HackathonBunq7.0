from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class FraudOutcome(str, Enum):
    no_strong_scam_presence = "no_strong_scam_presence"
    legitimate_consistent_evidence = "legitimate_consistent_evidence"
    scam_identified = "scam_identified"

class RiskFactor(str, Enum):
    low = "Low"
    medium = "Medium"
    high = "High"


class CancellableAssistResponse(BaseModel):
    outcome: FraudOutcome
    scam_type: str | None = None
    reasons: list[str] = Field(default_factory=list)
    risk_factor: RiskFactor
    summary: str
    recommended_action: str

    @model_validator(mode="after")
    def validate_scam_shape(self):
        if self.outcome == FraudOutcome.scam_identified:
            if not self.scam_type:
                raise ValueError("scam_type is required when scam is identified")
            if len(self.reasons) != 3:
                raise ValueError("exactly 3 reasons are required when scam is identified")
        return self


class BunqAccount(BaseModel):
    id: int
    description: str
    balance: float
    currency: str
    iban: Optional[str] = None
    type: str


class BunqPayment(BaseModel):
    id: int
    created: Optional[str] = None
    updated: Optional[str] = None
    amount: float
    currency: str
    description: str
    counterparty_name: Optional[str] = None
    counterparty_iban: Optional[str] = None
    type: Optional[str] = None
    sub_type: Optional[str] = None


class BunqCard(BaseModel):
    id: int
    name_on_card: str
    last_four: Optional[str] = None
    type: Optional[str] = None
    sub_type: Optional[str] = None
    status: Optional[str] = None


class CreatePaymentRequest(BaseModel):
    monetary_account_id: int
    amount: str = Field(..., description="Decimal string, e.g. '12.50'")
    currency: str = "EUR"
    counterparty_iban: str
    counterparty_name: str = "Recipient"
    description: str = ""
    draft: bool = False


class CreatePaymentResponse(BaseModel):
    id: int
    draft: bool

