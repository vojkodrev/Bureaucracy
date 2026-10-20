#!/usr/bin/env bash

set -euo pipefail

APP_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
VIRTUAL_ENVIRONMENT="$APP_DIRECTORY/.venv"
PYTHON="$VIRTUAL_ENVIRONMENT/bin/python"

if command -v python3.12 >/dev/null 2>&1; then
    SYSTEM_PYTHON="$(command -v python3.12)"
elif command -v python3 >/dev/null 2>&1; then
    SYSTEM_PYTHON="$(command -v python3)"
else
    echo "Python 3.12 or newer was not found. Install it first (for example: brew install python@3.12)." >&2
    exit 1
fi

if ! "$SYSTEM_PYTHON" -c 'import sys; raise SystemExit(sys.version_info < (3, 12))'; then
    echo "Python 3.12 or newer is required. Found: $("$SYSTEM_PYTHON" --version 2>&1)" >&2
    exit 1
fi

if [[ ! -x "$PYTHON" ]]; then
    "$SYSTEM_PYTHON" -m venv "$VIRTUAL_ENVIRONMENT"
fi

"$PYTHON" -m pip install --upgrade pip
"$PYTHON" -m pip install -r "$APP_DIRECTORY/requirements.txt"

echo "Installation complete."
echo "Copy .env.example to .env, set the MSSQL values, then run:"
echo "\"$APP_DIRECTORY/train.sh\""
