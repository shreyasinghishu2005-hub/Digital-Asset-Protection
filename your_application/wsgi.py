"""
ASGI app exposed as `application` for:
  gunicorn your_application.wsgi:application -k uvicorn.workers.UvicornWorker

Keeps imports working when the process cwd is the repo root (Render: /opt/render/project/src).
"""

from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parent.parent
_backend = _root / "backend"
if str(_backend) not in sys.path:
    sys.path.insert(0, str(_backend))

from app.main import app as application  # noqa: E402
