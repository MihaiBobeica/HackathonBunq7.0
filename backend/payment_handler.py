from __future__ import annotations

import logging
from typing import Any

import bunq_client
from schemas import (
    AccountOut,
    AccountsResponse,
    DraftPaymentRequest,
    DraftPaymentResponse,
    IbanCheckResponse,
    IbanSignals,
    PaymentRequest,
    PaymentResponse,
    TransactionOut,
    TransactionsResponse,
)

log = logging.getLogger(__name__)


_MOCK_ACCOUNTS = [
    AccountOut(id=1, label="Main Account", sub="NL12 BUNQ 0001 2345 67", amount="€ 4.200,00"),
    AccountOut(id=2, label="Savings", sub="NL34 BUNQ 0007 6543 21", amount="€ 12.500,00"),
]
_MOCK_TRANSACTIONS = [
    TransactionOut(id=101, name="Albert Heijn", cat="Groceries", amount="- € 34,50"),
    TransactionOut(id=102, name="Salary", cat="Income", amount="+ € 2.800,00"),
    TransactionOut(id=103, name="Spotify", cat="Subscriptions", amount="- € 10,99"),
]


def _format_amount(value: str | float, currency: str = "EUR", signed: bool = True) -> str:
    """Format an amount as European convention: '€ 4.200,00' or '- € 4.200,00'."""
    try:
        v = float(value)
    except (TypeError, ValueError):
        return f"€ {value}"
    sign = ""
    if signed:
        if v < 0:
            sign = "- "
            v = -v
        else:
            sign = "+ "
    symbol = "€" if currency == "EUR" else currency
    whole, _, frac = f"{v:,.2f}".partition(".")
    whole = whole.replace(",", ".")
    return f"{sign}{symbol} {whole},{frac}"


def _unwrap_account(ma: Any):
    """bunq MonetaryAccount.list() returns a union — pull the active inner type."""
    for attr in (
        "MonetaryAccountBank",
        "MonetaryAccountSavings",
        "MonetaryAccountJoint",
        "MonetaryAccountLight",
    ):
        inner = getattr(ma, attr, None)
        if inner is not None:
            return inner
    return None


def _account_iban(inner: Any) -> str:
    aliases = getattr(inner, "alias", None) or []
    for a in aliases:
        atype = getattr(a, "type_", None) or getattr(a, "type", None)
        if atype == "IBAN":
            return getattr(a, "value", "") or ""
    return ""


class PaymentHandler:
    """Bunq-backed handlers. All methods degrade to mock data on failure."""

    # --- Existing simple payment endpoint (kept for compat) ---
    def pay_request(self, body: PaymentRequest) -> PaymentResponse:
        return PaymentResponse(
            status="stub",
            payment_id="0",
            amount=body.amount,
            currency=body.currency,
            recipient=body.recipient,
            message="Use /api/draft-payment instead — kept for back-compat",
        )

    # --- Real bunq calls ---
    def list_accounts(self) -> AccountsResponse:
        if not bunq_client.init_bunq_context():
            return AccountsResponse(accounts=_MOCK_ACCOUNTS, fallback=True)

        try:
            from bunq.sdk.model.generated.endpoint import MonetaryAccountApiObject as MonetaryAccount

            raw = MonetaryAccount.list().value
        except Exception as e:
            log.exception("MonetaryAccount.list failed: %s", e)
            return AccountsResponse(accounts=_MOCK_ACCOUNTS, fallback=True)

        out: list[AccountOut] = []
        for ma in raw:
            inner = _unwrap_account(ma)
            if inner is None:
                continue
            try:
                amount = _format_amount(inner.balance.value, inner.balance.currency, signed=False)
                out.append(AccountOut(
                    id=int(inner.id_),
                    label=inner.description or "Account",
                    sub=_account_iban(inner) or "",
                    amount=amount,
                ))
            except Exception as e:
                log.warning("skip account, parse failed: %s", e)

        if not out:
            return AccountsResponse(accounts=_MOCK_ACCOUNTS, fallback=True)
        return AccountsResponse(accounts=out, fallback=False)

    def _primary_account_id(self) -> int | None:
        try:
            from bunq.sdk.model.generated.endpoint import MonetaryAccountApiObject as MonetaryAccount

            for ma in MonetaryAccount.list().value:
                inner = _unwrap_account(ma)
                if inner is None:
                    continue
                status = getattr(inner, "status", "ACTIVE")
                if status == "ACTIVE":
                    return int(inner.id_)
        except Exception as e:
            log.warning("primary account lookup failed: %s", e)
        return None

    def list_transactions(self, account_id: int | None = None, limit: int = 10) -> TransactionsResponse:
        if not bunq_client.init_bunq_context():
            return TransactionsResponse(transactions=_MOCK_TRANSACTIONS[:limit], fallback=True)

        try:
            from bunq.sdk.model.generated.endpoint import PaymentApiObject as Payment

            primary = account_id or self._primary_account_id()
            if primary is None:
                return TransactionsResponse(transactions=_MOCK_TRANSACTIONS[:limit], fallback=True)

            raw = Payment.list(
                monetary_account_id=primary,
                params={"count": str(min(limit, 50))},
            ).value
        except Exception as e:
            log.exception("Payment.list failed: %s", e)
            return TransactionsResponse(transactions=_MOCK_TRANSACTIONS[:limit], fallback=True)

        out: list[TransactionOut] = []
        for p in raw[:limit]:
            try:
                amount_val = p.amount.value
                amount_cur = p.amount.currency
                cp = p.counterparty_alias
                name = (
                    getattr(cp, "display_name", None)
                    or getattr(getattr(cp, "label_monetary_account", None), "display_name", None)
                    or "Unknown"
                )
                cat = (p.description or "Payment")[:40]
                out.append(TransactionOut(
                    id=int(p.id_),
                    name=name,
                    cat=cat,
                    amount=_format_amount(amount_val, amount_cur, signed=True),
                ))
            except Exception as e:
                log.warning("skip transaction, parse failed: %s", e)

        if not out:
            return TransactionsResponse(transactions=_MOCK_TRANSACTIONS[:limit], fallback=True)
        return TransactionsResponse(transactions=out, fallback=False)

    def iban_check(self, iban: str, amount: float | None = None) -> IbanCheckResponse:
        norm = (iban or "").replace(" ", "").upper()
        amt = float(amount or 0)
        high_amount = amt > 500

        # Default: assume new beneficiary (paranoid)
        new_beneficiary = True
        first_seen: str | None = None
        payment_count = 0

        if bunq_client.init_bunq_context():
            try:
                from bunq.sdk.model.generated.endpoint import PaymentApiObject as Payment

                primary = self._primary_account_id()
                if primary is not None:
                    raw = Payment.list(
                        monetary_account_id=primary,
                        params={"count": "100"},
                    ).value

                    for p in raw:
                        try:
                            cp = p.counterparty_alias
                            cp_iban = ""
                            label = getattr(cp, "label_monetary_account", None)
                            if label is not None:
                                cp_iban = (getattr(label, "iban", "") or "").replace(" ", "").upper()
                            if cp_iban and cp_iban == norm:
                                payment_count += 1
                                created = getattr(p, "created", None)
                                if created and (first_seen is None or str(created) < first_seen):
                                    first_seen = str(created)
                        except Exception:
                            continue

                    new_beneficiary = payment_count == 0
            except Exception as e:
                log.warning("iban_check history scan failed: %s", e)

        flagged = new_beneficiary and high_amount
        if flagged:
            reason = "New beneficiary with high first-payment amount"
        elif new_beneficiary:
            reason = "First payment to this counterparty — review carefully"
        elif high_amount:
            reason = "Known counterparty, but unusually large amount"
        else:
            reason = "No risk signals on this counterparty"

        return IbanCheckResponse(
            flagged=flagged,
            reason=reason,
            signals=IbanSignals(
                new_beneficiary=new_beneficiary,
                high_amount=high_amount,
                first_seen=first_seen,
                payment_count=payment_count,
            ),
        )

    def create_draft_payment(self, body: DraftPaymentRequest) -> DraftPaymentResponse:
        if not bunq_client.init_bunq_context():
            return DraftPaymentResponse(status="fallback", message="bunq context unavailable")

        try:
            from bunq.sdk.model.generated.endpoint import DraftPaymentApiObject as DraftPayment, PaymentApiObject as PaymentEndpoint
            from bunq.sdk.model.generated.object_ import Amount, Pointer

            primary = self._primary_account_id()
            if primary is None:
                return DraftPaymentResponse(status="error", message="No active account")

            try:
                amt_value = float(body.amount.replace("€", "").replace(",", ".").replace(" ", "").strip())
            except ValueError:
                return DraftPaymentResponse(status="error", message=f"Invalid amount: {body.amount}")

            amount = Amount(value=f"{amt_value:.2f}", currency="EUR")
            counterparty = Pointer(type_="IBAN", value=body.iban, name=body.counterparty_name)

            entry = PaymentEndpoint(
                amount=amount,
                counterparty_alias=counterparty,
                description=body.description or "Warden draft",
            )

            draft_id = DraftPayment.create(
                entries=[entry],
                monetary_account_id=primary,
            ).value

            return DraftPaymentResponse(
                draft_id=int(draft_id) if draft_id else None,
                status="pending",
                message="Draft payment created — awaiting approval",
            )
        except Exception as e:
            log.exception("draft payment create failed")
            return DraftPaymentResponse(status="error", message=f"{e}")
