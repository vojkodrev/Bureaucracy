#!/usr/bin/env bash

set -euo pipefail

VERSION="${1:-26.7.5}"
SHA256="${2:-30ef87fb7101c43d29688d1ae80c0588ff4a151b3330e9f664bf9692d398658a}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"

for command in java curl shasum unzip; do
    if ! command -v "$command" >/dev/null 2>&1; then
        echo "Required command '$command' was not found." >&2
        exit 1
    fi
done

JAVA_VERSION_OUTPUT="$(java -version 2>&1)"
if ! printf '%s\n' "$JAVA_VERSION_OUTPUT" | grep -Eq 'version "25([.]|\")'; then
    echo "Keycloak requires the configured OpenJDK 25 installation. Found: $JAVA_VERSION_OUTPUT" >&2
    echo "Install it with: brew install openjdk@25" >&2
    exit 1
fi

if [[ -e "$SERVER_DIR" ]]; then
    echo "Keycloak is already installed at '$SERVER_DIR'. Move or remove it explicitly before reinstalling." >&2
    exit 1
fi

ARCHIVE_NAME="keycloak-$VERSION.zip"
DOWNLOAD_URL="https://github.com/keycloak/keycloak/releases/download/$VERSION/$ARCHIVE_NAME"
TEMPORARY_DIR="$(mktemp -d "${TMPDIR:-/tmp}/bureaucracy-keycloak.XXXXXX")"
ARCHIVE_PATH="$TEMPORARY_DIR/$ARCHIVE_NAME"
EXTRACT_DIR="$TEMPORARY_DIR/extracted"

cleanup() {
    rm -rf "$TEMPORARY_DIR"
}
trap cleanup EXIT

mkdir -p "$EXTRACT_DIR"
echo "Downloading Keycloak $VERSION..."
curl --fail --location --show-error --output "$ARCHIVE_PATH" "$DOWNLOAD_URL"

ACTUAL_HASH="$(shasum -a 256 "$ARCHIVE_PATH" | awk '{print $1}')"
if [[ "$ACTUAL_HASH" != "$SHA256" ]]; then
    echo "Checksum verification failed. Expected $SHA256 but received $ACTUAL_HASH." >&2
    exit 1
fi

unzip -q "$ARCHIVE_PATH" -d "$EXTRACT_DIR"
EXPANDED_SERVER="$EXTRACT_DIR/keycloak-$VERSION"
if [[ ! -d "$EXPANDED_SERVER" ]]; then
    echo "The archive did not contain the expected keycloak-$VERSION directory." >&2
    exit 1
fi

mv "$EXPANDED_SERVER" "$SERVER_DIR"
cp "$SCRIPT_DIR/keycloak.conf.example" "$SERVER_DIR/conf/keycloak.conf"
mkdir -p "$SERVER_DIR/data/import"
cp "$SCRIPT_DIR/realm-export.json" "$SERVER_DIR/data/import/bureaucracy-realm.json"

if [[ ! -f "$SCRIPT_DIR/.env" ]]; then
    cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env"
    echo "Warning: Created '$SCRIPT_DIR/.env'. Replace every placeholder password before starting Keycloak." >&2
fi

"$SERVER_DIR/bin/kc.sh" build --db=mssql

echo "Keycloak $VERSION was installed in '$SERVER_DIR'."
echo "Edit keycloak/.env, prepare the MSSQL database, then run keycloak/run-prod.sh."
