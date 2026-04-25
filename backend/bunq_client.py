from __future__ import annotations

import logging
from typing import Optional

from config import settings

log = logging.getLogger(__name__)

_initialized: bool = False
_init_error: Optional[str] = None


def init_bunq_context() -> bool:
    """Create or restore the bunq API context. Idempotent.

    Returns True on success, False if SDK or key is unavailable. Stores the
    last error in module state so endpoints can surface it without crashing.
    """
    global _initialized, _init_error

    if _initialized:
        return True

    if not settings.bunq_api_key:
        _init_error = "BUNQ_API_KEY not set"
        log.warning("bunq context skipped: %s", _init_error)
        return False

    try:
        from bunq.sdk.context.api_context import ApiContext
        from bunq.sdk.context.api_environment_type import ApiEnvironmentType
        from bunq.sdk.context.bunq_context import BunqContext
    except ImportError as e:
        _init_error = f"bunq_sdk not installed: {e}"
        log.warning(_init_error)
        return False

    env_map = {
        "SANDBOX": ApiEnvironmentType.SANDBOX,
        "PRODUCTION": ApiEnvironmentType.PRODUCTION,
    }
    env = env_map.get(settings.bunq_env, ApiEnvironmentType.SANDBOX)
    conf_path = str(settings.bunq_conf_path)

    try:
        if settings.bunq_conf_path.exists():
            ctx = ApiContext.restore(conf_path)
            ctx.ensure_session_active()
        else:
            ctx = ApiContext.create(env, settings.bunq_api_key, settings.bunq_device_description)
        ctx.save(conf_path)
        BunqContext.load_api_context(ctx)
    except Exception as e:
        _init_error = f"bunq context init failed: {e}"
        log.exception(_init_error)
        return False

    _initialized = True
    _init_error = None
    log.info("bunq context initialized (env=%s)", settings.bunq_env)
    return True


def is_ready() -> bool:
    return _initialized


def last_error() -> Optional[str]:
    return _init_error
