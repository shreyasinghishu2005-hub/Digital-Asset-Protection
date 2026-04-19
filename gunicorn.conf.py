"""Gunicorn config (optional)."""

import os

bind = f"0.0.0.0:{os.getenv('PORT', '8000')}"
workers = 1
timeout = 120
accesslog = "-"
errorlog = "-"

# If the platform supports it (or if you run `gunicorn -c gunicorn.conf.py ...`), use ASGI worker.
worker_class = "uvicorn.workers.UvicornWorker"

