from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field, model_validator


class FraudOutcome(str, Enum):
    no_strong_scam_presence = "no_strong_scam_presence"
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
