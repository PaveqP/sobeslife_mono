#!/bin/sh
set -e
if [ ! -d node_modules/react ]; then
  echo "[web] Installing dependencies (first run or empty node_modules)..."
  npm ci
fi
exec "$@"
