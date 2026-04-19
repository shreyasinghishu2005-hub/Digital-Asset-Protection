"""
WSGI entrypoint for platforms that default to:

  gunicorn your_application.wsgi

This repo is FastAPI (ASGI), so we adapt ASGI -> WSGI using a2wsgi's ASGIMiddleware.
That prevents the common Render error:

  TypeError: FastAPI.__call__() missing 1 required positional argument: 'send'

We also ensure `backend/` is on sys.path so imports work from the repo root.
"""

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
_backend = _root / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from a2wsgi import ASGIMiddleware  # noqa: E402

from app.main import app as asgi_app  # noqa: E402

# Gunicorn expects a WSGI callable named `application`.
application = ASGIMiddleware(asgi_app)
