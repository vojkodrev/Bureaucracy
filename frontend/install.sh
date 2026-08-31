#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing frontend dependencies..."
npm ci --prefix "$SCRIPT_DIR"

echo "Installation complete."
