#!/usr/bin/env bash
# Render build script — Python deps + React frontend build
set -eo pipefail

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Node version: $(node --version)"
echo "==> npm version: $(npm --version)"

echo "==> Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Build complete. frontend/dist is ready."
