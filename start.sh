#!/usr/bin/env bash
# Render / PaaS start script — use this as Start Command:  bash start.sh
set -euo pipefail
cd "$(dirname "$0")"
exec gunicorn your_application.wsgi:application \
  -k uvicorn.workers.UvicornWorker \
  -w 1 \
  --bind "0.0.0.0:${PORT}" \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
