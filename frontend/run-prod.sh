#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

npm run build --prefix "$SCRIPT_DIR"
exec npm run preview --prefix "$SCRIPT_DIR" -- "$@"
