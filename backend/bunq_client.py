"""bunq SDK lifecycle + thin domain helpers.

The SDK requires a one-time installation/device-registration handshake against
the bunq API, after which it stores an RSA keypair and session token in a
context file. We persist that file to disk so subsequent backend restarts reuse
the same session instead of re-installing on every boot (sandbox tolerates
re-installs but production has rate limits).
"""

from __future__ import annotations

import os
import threading
from pathlib import Path
from typing import Any

from bunq.sdk.context.api_context import ApiContext
from bunq.sdk.context.api_environment_type import ApiEnvironmentType
from bunq.sdk.context.bunq_context import BunqContext
from bunq.sdk.model.generated.endpoint import (
    CardApiObject,
    DraftPaymentApiObject,
    MonetaryAccountApiObject,
    PaymentApiObject,
    RequestInquiryApiObject,
)
from bunq.sdk.model.generated.object_ import AmountObject, DraftPaymentEntryObject, PointerObject

DEVICE_DESCRIPTION = "bunq-sentinel-backend"

_lock = threading.Lock()
_initialized = False


def _resolve_environment(name: str) -> ApiEnvironmentType:
    return ApiEnvironmentType.PRODUCTION if name.upper() == "PRODUCTION" else ApiEnvironmentType.SANDBOX


def _load_or_create_context(api_key: str, env: ApiEnvironmentType, context_path: Path) -> ApiContext:
    if context_path.exists():
        ctx = ApiContext.restore(str(context_path))
        # Refresh if the cached session expired.
        ctx.ensure_session_active()
        ctx.save(str(context_path))
        return ctx

    context_path.parent.mkdir(parents=True, exist_ok=True)
    ctx = ApiContext.create(env, api_key, DEVICE_DESCRIPTION)
    ctx.save(str(context_path))
    return ctx


def ensure_initialized() -> None:
    """Initialize BunqContext once per process. Safe to call repeatedly."""
    global _initialized
    if _initialized:
        return
    with _lock:
        if _initialized:
            return
        api_key = (os.environ.get("BUNQ_API_KEY") or "").strip()
        if not api_key:
            raise RuntimeError("BUNQ_API_KEY is not configured.")
        env = _resolve_environment(os.environ.get("BUNQ_ENVIRONMENT", "SANDBOX"))
        context_path = Path(os.environ.get("BUNQ_CONTEXT_FILE", "/app/data/bunq.context"))
        ctx = _load_or_create_context(api_key, env, context_path)
        BunqContext.load_api_context(ctx)
        _initialized = True


def is_configured() -> bool:
    return bool((os.environ.get("BUNQ_API_KEY") or "").strip())


# --------------------------- domain helpers ---------------------------

def _pick_account_subtype(monetary_account: Any) -> Any | None:
    """A MonetaryAccount is a union; pick whichever concrete sub-account is set."""
    for attr in (
        "MonetaryAccountBank",
        "MonetaryAccountSavings",
        "MonetaryAccountJoint",
        "MonetaryAccountLight",
        "MonetaryAccountExternal",
        "MonetaryAccountExternalSavings",
    ):
        sub = getattr(monetary_account, attr, None)
        if sub is not None:
            return sub
    return None


def _iban_from_aliases(aliases: list[Any] | None) -> str | None:
    if not aliases:
        return None
    for alias in aliases:
        if getattr(alias, "type_", None) == "IBAN":
            return getattr(alias, "value", None)
    return None


def _serialize_account(monetary_account: Any) -> dict[str, Any] | None:
    sub = _pick_account_subtype(monetary_account)
    if sub is None or getattr(sub, "status", None) != "ACTIVE":
        return None
    balance = getattr(sub, "balance", None)
    return {
        "id": getattr(sub, "id_", None),
        "description": getattr(sub, "description", None) or "Account",
        "balance": float(balance.value) if balance and balance.value is not None else 0.0,
        "currency": getattr(balance, "currency", "EUR") if balance else "EUR",
        "iban": _iban_from_aliases(getattr(sub, "alias", None)),
        "type": type(sub).__name__,
    }


def list_accounts() -> list[dict[str, Any]]:
    ensure_initialized()
    response = MonetaryAccountApiObject.list()
    out: list[dict[str, Any]] = []
    for ma in response.value:
        serialized = _serialize_account(ma)
        if serialized is not None:
            out.append(serialized)
    return out


def _serialize_payment(payment: Any) -> dict[str, Any]:
    amount = getattr(payment, "amount", None)
    counterparty = getattr(payment, "counterparty_alias", None)
    counterparty_label = getattr(counterparty, "label_monetary_account", None) if counterparty else None
    return {
        "id": getattr(payment, "id_", None),
        "created": getattr(payment, "created", None),
        "updated": getattr(payment, "updated", None),
        "amount": float(amount.value) if amount and amount.value is not None else 0.0,
        "currency": getattr(amount, "currency", "EUR") if amount else "EUR",
        "description": getattr(payment, "description", "") or "",
        "counterparty_name": getattr(counterparty_label, "display_name", None) if counterparty_label else None,
        "counterparty_iban": getattr(counterparty_label, "iban", None) if counterparty_label else None,
        "type": getattr(payment, "type_", None),
        "sub_type": getattr(payment, "sub_type", None),
    }


def list_payments(monetary_account_id: int, count: int = 25) -> list[dict[str, Any]]:
    ensure_initialized()
    response = PaymentApiObject.list(
        monetary_account_id=monetary_account_id,
        params={"count": str(count)},
    )
    return [_serialize_payment(p) for p in response.value]


def create_payment(
    monetary_account_id: int,
    amount_value: str,
    currency: str,
    counterparty_iban: str,
    counterparty_name: str,
    description: str,
) -> int:
    """Create an immediate SEPA payment. Returns the new payment id."""
    ensure_initialized()
    response = PaymentApiObject.create(
        amount=AmountObject(value=amount_value, currency=currency),
        counterparty_alias=PointerObject(type_="IBAN", value=counterparty_iban, name=counterparty_name),
        description=description,
        monetary_account_id=monetary_account_id,
    )
    return int(response.value)


def create_draft_payment(
    monetary_account_id: int,
    amount_value: str,
    currency: str,
    counterparty_iban: str,
    counterparty_name: str,
    description: str,
) -> int:
    """Create a draft payment that requires a second approval before sending.

    Useful for the Sentinel "24h safety window" flow: the payment exists but
    has not left the account yet, and can be cancelled by updating its status.
    """
    ensure_initialized()
    entry = DraftPaymentEntryObject(
        amount=AmountObject(value=amount_value, currency=currency),
        counterparty_alias=PointerObject(type_="IBAN", value=counterparty_iban, name=counterparty_name),
        description=description,
    )
    response = DraftPaymentApiObject.create(
        entries=[entry],
        number_of_required_accepts=1,
        monetary_account_id=monetary_account_id,
        status="ACTIVE",
    )
    return int(response.value)


def cancel_draft_payment(monetary_account_id: int, draft_payment_id: int) -> None:
    ensure_initialized()
    DraftPaymentApiObject.update(
        draft_payment_id=draft_payment_id,
        monetary_account_id=monetary_account_id,
        status="CANCELLED",
    )


def _serialize_card(card: Any) -> dict[str, Any]:
    label_card = getattr(card, "label_card", None)
    return {
        "id": getattr(card, "id_", None),
        "name_on_card": getattr(card, "name_on_card", "") or "",
        "last_four": getattr(label_card, "second_line", None) if label_card else None,
        "type": getattr(card, "type_", None),
        "sub_type": getattr(card, "sub_type", None),
        "status": getattr(card, "status", None),
    }


def fund_sandbox_account(
    monetary_account_id: int,
    amount_value: str = "500.00",
    currency: str = "EUR",
) -> int:
    """Sandbox-only: ask sugardaddy@bunq.com for money. The sandbox auto-accepts.

    Returns the request inquiry id. Bunq's sandbox sugardaddy responds within
    a few seconds; balance updates on next /bunq/accounts read.
    """
    ensure_initialized()
    response = RequestInquiryApiObject.create(
        amount_inquired=AmountObject(value=amount_value, currency=currency),
        counterparty_alias=PointerObject(type_="EMAIL", value="sugardaddy@bunq.com", name="Sugar Daddy"),
        description="Sandbox top-up",
        allow_bunqme=False,
        monetary_account_id=monetary_account_id,
    )
    return int(response.value)


def list_cards() -> list[dict[str, Any]]:
    ensure_initialized()
    response = CardApiObject.list()
    return [_serialize_card(c) for c in response.value]
