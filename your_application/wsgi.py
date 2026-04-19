"""
Entrypoint for platforms that default to:

  gunicorn your_application.wsgi

Some hosts run Gunicorn with a **WSGI** sync worker (expects (environ, start_response)).
Others (including some Render setups) run with an **ASGI** worker (UvicornWorker) which
expects (scope, receive, send).

To avoid “server error” loops, we export a single `application` callable that can handle
**either** calling convention by dispatching to:

- FastAPI ASGI app (direct)
- a2wsgi ASGI->WSGI adapter (for sync workers)
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

wsgi_app = ASGIMiddleware(asgi_app)


class _HybridApp:
    def __init__(self, asgi, wsgi):
        self._asgi = asgi
        self._wsgi = wsgi

    def __call__(self, *args, **kwargs):
        # ASGI: (scope: dict, receive: callable, send: callable)
        if len(args) == 3 and isinstance(args[0], dict) and "type" in args[0]:
            return self._asgi(*args, **kwargs)
        # WSGI: (environ: dict, start_response: callable)
        return self._wsgi(*args, **kwargs)


# Gunicorn defaults to `application` if you run `gunicorn your_application.wsgi`.
application = _HybridApp(asgi_app, wsgi_app)
