#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/.bin"
BINARY="$BUILD_DIR/bureaucracy-backend"

mkdir -p "$BUILD_DIR"
go -C "$SCRIPT_DIR" build -trimpath -ldflags="-s -w" -o "$BINARY" .

export APP_ENV="${APP_ENV:-production}"
exec "$BINARY" "$@"
