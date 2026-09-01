#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export APP_ENV="${APP_ENV:-development}"
cd "$SCRIPT_DIR"
exec go run . "$@"
