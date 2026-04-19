"""
Gunicorn config for Render.

Render sometimes defaults the start command to:
  gunicorn your_application.wsgi

FastAPI is an ASGI app, so we must use UvicornWorker; otherwise Gunicorn will
treat it as WSGI and crash with:
  TypeError: FastAPI.__call__() missing 1 required positional argument: 'send'
"""

from __future__ import annotations

import os

worker_class = "uvicorn.workers.UvicornWorker"

# Render sets PORT. Fall back to 8000 for local runs.
bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"

# Render sets WEB_CONCURRENCY; default to 1 on free plans.
workers = int(os.getenv("WEB_CONCURRENCY", "1"))

timeout = int(os.getenv("GUNICORN_TIMEOUT", "120"))
graceful_timeout = int(os.getenv("GUNICORN_GRACEFUL_TIMEOUT", "30"))

accesslog = "-"
errorlog = "-"
