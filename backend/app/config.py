"""Environment-driven settings (no secrets in code)."""

from __future__ import annotations

import os

# Comma-separated list, e.g. "http://localhost:5173,https://myapp.vercel.app"
def cors_origins() -> list[str]:
    raw = os.getenv(
        "CORS_ORIGINS",
        "http://127.0.0.1:5173,http://localhost:5173",
    )
    out = [o.strip() for o in raw.split(",") if o.strip()]
    # Empty list can break CORS middleware / clients when env is set to "" on hosts like Render.
    if not out:
        return ["*"]
    return out


def max_upload_bytes() -> int:
    return int(os.getenv("MAX_UPLOAD_BYTES", str(25 * 1024 * 1024)))


def gemini_api_key() -> str | None:
    k = os.getenv("GEMINI_API_KEY", "").strip()
    return k or None
