"""Environment-driven settings (no secrets in code)."""

from __future__ import annotations

import os


def cors_origins() -> list[str]:
    """
    Comma-separated origins, e.g. "http://localhost:5173,https://myapp.vercel.app"
    Defaults to * so Render deployments work out of the box.
    """
    raw = os.getenv("CORS_ORIGINS", "*")
    out = [o.strip() for o in raw.split(",") if o.strip()]
    if not out:
        return ["*"]
    return out


def max_upload_bytes() -> int:
    return int(os.getenv("MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))


def gemini_api_key() -> str | None:
    k = os.getenv("GEMINI_API_KEY", "").strip()
    return k or None
