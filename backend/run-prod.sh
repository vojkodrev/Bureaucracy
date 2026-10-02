#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/.bin"
BINARY="$SCRIPT_DIR/.bin/bureaucracy-backend"
CERT_DIR="$SCRIPT_DIR/../certs"

if [[ ! -f "$CERT_DIR/bureaucracy.crt" || ! -f "$CERT_DIR/bureaucracy.key" || ! -f "$CERT_DIR/bureaucracy-ca.crt" ]]; then
    echo "HTTPS certificates are missing. Run certs/generate.sh first." >&2
    exit 1
fi

mkdir -p "$BUILD_DIR"
go -C "$SCRIPT_DIR" build -trimpath -ldflags="-s -w" -o "$BINARY" .

export APP_ENV="${APP_ENV:-production}"
cd "$SCRIPT_DIR"
exec "$BINARY" "$@"
