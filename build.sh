#!/usr/bin/env bash
# Render build script — installs Python deps + builds React frontend
set -eo pipefail

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Installing Node.js (if not present)..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "==> Node version: $(node --version)"
echo "==> npm version: $(npm --version)"

echo "==> Building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Build complete. frontend/dist ready."
