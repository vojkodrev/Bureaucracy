#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Generating GraphQL code from schema.graphqls..."
go -C "$SCRIPT_DIR" tool gqlgen generate

echo "GraphQL schema resolved successfully."
