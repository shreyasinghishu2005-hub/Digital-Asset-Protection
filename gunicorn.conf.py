"""Gunicorn config for Render (ASGI via UvicornWorker)."""

import os

# Render sets PORT=10000 by default
bind = f"0.0.0.0:{os.getenv('PORT', '10000')}"
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 120
accesslog = "-"
errorlog = "-"
