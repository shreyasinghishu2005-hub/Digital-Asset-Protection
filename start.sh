#!/usr/bin/env bash
# Render / PaaS start script
set -eo pipefail
cd "$(dirname "$0")"
export PORT="${PORT:-10000}"
exec gunicorn your_application.wsgi:application \
  -c gunicorn.conf.py \
  -k uvicorn.workers.UvicornWorker \
  -w 1 \
  --bind "0.0.0.0:${PORT}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
