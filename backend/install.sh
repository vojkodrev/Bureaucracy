#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing backend dependencies..."
go -C "$SCRIPT_DIR" mod download
go -C "$SCRIPT_DIR" mod verify

echo "Installation complete."
