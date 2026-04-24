from __future__ import annotations

from schemas import PaymentRequest, PaymentResponse


class PaymentHandler:
    def pay_request(self, body: PaymentRequest) -> PaymentResponse:
        raise NotImplementedError
