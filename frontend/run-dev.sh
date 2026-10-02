#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="$SCRIPT_DIR/../certs"

if [[ ! -f "$CERT_DIR/bureaucracy.crt" || ! -f "$CERT_DIR/bureaucracy.key" ]]; then
    echo "HTTPS certificates are missing. Run certs/generate.sh first." >&2
    exit 1
fi

npm install --prefix "$SCRIPT_DIR"
exec npm run dev --prefix "$SCRIPT_DIR" -- "$@"
