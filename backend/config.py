from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(_BACKEND_DIR / ".env", override=True)


@dataclass(frozen=True)
class Settings:
    anthropic_api_key: str
    anthropic_model: str
    bunq_api_key: str
    bunq_env: str
    bunq_device_description: str
    bunq_conf_path: Path
    frontend_origin: str
    backend_port: int


def _get(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def load_settings() -> Settings:
    return Settings(
        anthropic_api_key=_get("ANTHROPIC_API_KEY"),
        anthropic_model=_get("ANTHROPIC_MODEL", "claude-opus-4-7"),
        bunq_api_key=_get("BUNQ_API_KEY"),
        bunq_env=_get("BUNQ_ENV", "SANDBOX").upper(),
        bunq_device_description=_get("BUNQ_DEVICE_DESCRIPTION", "Warden-Hackathon-Device"),
        bunq_conf_path=_BACKEND_DIR / _get("BUNQ_CONF_PATH", "bunq-sandbox.conf"),
        frontend_origin=_get("FRONTEND_ORIGIN", "http://localhost:5173"),
        backend_port=int(_get("BACKEND_PORT", "8000")),
    )


settings = load_settings()
