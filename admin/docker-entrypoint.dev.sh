#!/bin/sh
set -e
echo "[admin] npm ci (sync node_modules volume with package-lock.json)..."
npm ci
# Vite 8 (rolldown) + Tailwind 4 (lightningcss): optional нативные пакеты.
# Второй отдельный `npm install … --no-save` снимает первый optional — ставим одной командой (см. npm/cli#4828).
ARCH=$(uname -m)
if [ -f node_modules/rolldown/package.json ] && [ -f node_modules/lightningcss/package.json ]; then
  RV=$(node -p "require('./node_modules/rolldown/package.json').version")
  LV=$(node -p "require('./node_modules/lightningcss/package.json').version")
  case "$ARCH" in
    aarch64)
      NEED=0
      if ! node -e "require('@rolldown/binding-linux-arm64-gnu')" 2>/dev/null; then NEED=1; fi
      if ! node -e "require('lightningcss-linux-arm64-gnu')" 2>/dev/null; then NEED=1; fi
      if [ "$NEED" -eq 1 ]; then
        echo "[admin] Installing native bindings: @rolldown/binding-linux-arm64-gnu@${RV} + lightningcss-linux-arm64-gnu@${LV}..."
        npm install "@rolldown/binding-linux-arm64-gnu@${RV}" "lightningcss-linux-arm64-gnu@${LV}" --no-save
      fi
      ;;
    x86_64)
      NEED=0
      if ! node -e "require('@rolldown/binding-linux-x64-gnu')" 2>/dev/null; then NEED=1; fi
      if ! node -e "require('lightningcss-linux-x64-gnu')" 2>/dev/null; then NEED=1; fi
      if [ "$NEED" -eq 1 ]; then
        echo "[admin] Installing native bindings: @rolldown/binding-linux-x64-gnu@${RV} + lightningcss-linux-x64-gnu@${LV}..."
        npm install "@rolldown/binding-linux-x64-gnu@${RV}" "lightningcss-linux-x64-gnu@${LV}" --no-save
      fi
      ;;
  esac
elif [ -f node_modules/rolldown/package.json ]; then
  RV=$(node -p "require('./node_modules/rolldown/package.json').version")
  case "$ARCH" in
    aarch64)
      if ! node -e "require('@rolldown/binding-linux-arm64-gnu')" 2>/dev/null; then
        echo "[admin] Installing @rolldown/binding-linux-arm64-gnu@${RV}..."
        npm install "@rolldown/binding-linux-arm64-gnu@${RV}" --no-save
      fi
      ;;
    x86_64)
      if ! node -e "require('@rolldown/binding-linux-x64-gnu')" 2>/dev/null; then
        echo "[admin] Installing @rolldown/binding-linux-x64-gnu@${RV}..."
        npm install "@rolldown/binding-linux-x64-gnu@${RV}" --no-save
      fi
      ;;
  esac
fi
exec "$@"
