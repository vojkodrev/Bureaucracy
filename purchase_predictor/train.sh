#!/usr/bin/env bash

set -euo pipefail

APP_DIRECTORY="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PYTHON="$APP_DIRECTORY/.venv/bin/python"

if [[ ! -x "$PYTHON" ]]; then
    echo "Python virtual environment not found. Run $APP_DIRECTORY/install.sh first." >&2
    exit 1
fi

cd "$APP_DIRECTORY"
export DYLD_LIBRARY_PATH="$(brew --prefix openssl@3)/lib${DYLD_LIBRARY_PATH:+:$DYLD_LIBRARY_PATH}"
exec "$PYTHON" "$APP_DIRECTORY/main.py" train "$@"
