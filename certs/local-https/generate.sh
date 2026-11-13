#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CA_CERT="$SCRIPT_DIR/bureaucracy-ca.crt"
CA_KEY="$SCRIPT_DIR/bureaucracy-ca.key"
CERT="$SCRIPT_DIR/bureaucracy.crt"
KEY="$SCRIPT_DIR/bureaucracy.key"
CONFIG="$SCRIPT_DIR/bureaucracy.cnf"

if [[ -e "$CA_CERT" || -e "$CA_KEY" || -e "$CERT" || -e "$KEY" ]]; then
    echo "Certificate files already exist in '$SCRIPT_DIR'; remove them explicitly before regenerating." >&2
    exit 1
fi

command -v openssl >/dev/null 2>&1 || { echo "OpenSSL is required." >&2; exit 1; }

umask 077
openssl req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes \
    -keyout "$CA_KEY" -out "$CA_CERT" -subj "/CN=Bureaucracy Local CA" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign"

openssl req -newkey rsa:2048 -nodes -keyout "$KEY" -out "$SCRIPT_DIR/bureaucracy.csr" \
    -subj "/CN=drevi-pc"

printf '%s\n' \
    '[server]' \
    'basicConstraints=critical,CA:FALSE' \
    'keyUsage=critical,digitalSignature,keyEncipherment' \
    'extendedKeyUsage=serverAuth' \
    'subjectAltName=DNS:localhost,DNS:drevi-pc,IP:127.0.0.1,IP:::1' > "$CONFIG"

openssl x509 -req -in "$SCRIPT_DIR/bureaucracy.csr" -CA "$CA_CERT" -CAkey "$CA_KEY" \
    -CAcreateserial -out "$CERT" -days 825 -sha256 -extfile "$CONFIG" -extensions server

rm "$SCRIPT_DIR/bureaucracy.csr" "$CONFIG" "$SCRIPT_DIR/bureaucracy-ca.srl"
chmod 600 "$CA_KEY" "$KEY"
chmod 644 "$CA_CERT" "$CERT"
echo "Certificates generated in '$SCRIPT_DIR'. Trust bureaucracy-ca.crt on client machines."
