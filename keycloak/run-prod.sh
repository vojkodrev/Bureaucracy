#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"
KEYCLOAK_COMMAND="$SERVER_DIR/bin/kc.sh"
ENVIRONMENT_FILE="$SCRIPT_DIR/.env"

if [[ ! -x "$KEYCLOAK_COMMAND" ]]; then
    echo "Keycloak is not installed. Run keycloak/install.sh first." >&2
    exit 1
fi

if [[ ! -f "$ENVIRONMENT_FILE" ]]; then
    echo "keycloak/.env was not found. Copy .env.example to .env and configure it first." >&2
    exit 1
fi

while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [[ -z "$line" || "$line" == \#* ]] && continue

    if [[ "$line" != *=* ]]; then
        echo "Invalid entry in '$ENVIRONMENT_FILE': $line" >&2
        exit 1
    fi

    name="${line%%=*}"
    value="${line#*=}"
    name="${name%"${name##*[![:space:]]}"}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"

    if [[ ! "$name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
        echo "Invalid variable name in '$ENVIRONMENT_FILE': $name" >&2
        exit 1
    fi

    if [[ ${#value} -ge 2 ]]; then
        first="${value:0:1}"
        last="${value: -1}"
        if [[ ( "$first" == '"' && "$last" == '"' ) || ( "$first" == "'" && "$last" == "'" ) ]]; then
            value="${value:1:${#value}-2}"
        fi
    fi

    export "$name=$value"
done < "$ENVIRONMENT_FILE"

required_variables=(
    KC_DB_USERNAME
    KC_DB_PASSWORD
    KC_HOSTNAME
    KC_BOOTSTRAP_ADMIN_USERNAME
    KC_BOOTSTRAP_ADMIN_PASSWORD
)

for name in "${required_variables[@]}"; do
    value="${!name:-}"
    if [[ -z "$value" || "$value" == replace_with_* ]]; then
        echo "Set $name to a real value in keycloak/.env before starting Keycloak." >&2
        exit 1
    fi
done

cd "$SERVER_DIR"
exec "$KEYCLOAK_COMMAND" start --optimized --import-realm "$@"
