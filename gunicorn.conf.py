"""Gunicorn config (optional).

If your host runs `gunicorn your_application.wsgi` without args, it may still load this file
depending on platform conventions. If it does, this ensures FastAPI runs correctly as ASGI.

Note: the repo also includes a WSGI adapter in `your_application/wsgi.py` (ASGI -> WSGI) so the
default sync worker still works even if this config is not loaded.
"""

bind = "0.0.0.0:${PORT}"
workers = 1
timeout = 120
accesslog = "-"
errorlog = "-"

# If the platform supports it (or if you run `gunicorn -c gunicorn.conf.py ...`), use ASGI worker.
worker_class = "uvicorn.workers.UvicornWorker"

