"""
Entrypoint for gunicorn with UvicornWorker (ASGI).

  gunicorn your_application.wsgi:application -k uvicorn.workers.UvicornWorker
"""

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
_backend = _root / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from app.main import app as application  # noqa: E402

__all__ = ["application"]
