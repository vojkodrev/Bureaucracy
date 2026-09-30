#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

npm install --prefix "$SCRIPT_DIR"
exec npm run dev --prefix "$SCRIPT_DIR" -- "$@"
