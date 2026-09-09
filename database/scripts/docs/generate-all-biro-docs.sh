#!/usr/bin/env bash

set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
workspace=$(cd "$script_dir/../.." && pwd)
database_list=$(mktemp)
trap 'rm -f "$database_list"' EXIT

while IFS='=' read -r key value; do
    value="${value%$'\r'}"
    case "$key" in
        MSSQL_HOST) db_host="$value" ;;
        MSSQL_PORT) db_port="$value" ;;
        MSSQL_USERNAME) db_username="$value" ;;
        MSSQL_PASSWORD) db_password="$value" ;;
        MSSQL_ENCRYPT) db_encrypt="$value" ;;
        MSSQL_TRUST_SERVER_CERTIFICATE) db_trust_cert="$value" ;;
    esac
done < "$workspace/backend/.env"

sqlcmd_args=(
    -S "${db_host},${db_port}"
    -d master
    -U "$db_username"
    -P "$db_password"
    -b
    -h -1
    -W
    -Q "SET NOCOUNT ON; SELECT name FROM sys.databases WHERE name LIKE 'BIRO[0-9][0-9][0-9]' ORDER BY name;"
)

if [[ "$db_encrypt" == "true" ]]; then sqlcmd_args+=(-N); fi
if [[ "$db_trust_cert" == "true" ]]; then sqlcmd_args+=(-C); fi

echo "Discovering BIRO databases..."
sqlcmd "${sqlcmd_args[@]}" > "$database_list"

database_count=0
while IFS= read -r database_name; do
    database_name="${database_name%$'\r'}"
    [[ -z "$database_name" ]] && continue

    if [[ ! "$database_name" =~ ^BIRO[0-9]{3}$ ]]; then
        echo "Skipping unexpected database name: $database_name" >&2
        continue
    fi

    echo
    echo "Generating documentation for $database_name..."
    "$script_dir/generate-database-docs.sh" "$database_name" < /dev/null
    ((database_count += 1))
done < "$database_list"

echo
echo "Generated documentation for $database_count BIRO databases."
