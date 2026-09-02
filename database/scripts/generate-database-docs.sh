#!/usr/bin/env bash

set -euo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
workspace=$(cd "$script_dir/../.." && pwd)

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 DATABASE_NAME" >&2
    exit 2
fi

database_name=$1
if [[ ! "$database_name" =~ ^(BIRO[0-9]{3}|Birokrat)$ ]]; then
    echo "Database name must match BIROXXX or be Birokrat." >&2
    exit 2
fi

source_dir=$(mktemp -d)
trap 'rm -rf "$source_dir"' EXIT

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

base_args=(-S "${db_host},${db_port}" -d "$database_name" -U "$db_username" -P "$db_password" -b)
if [[ "$db_encrypt" == "true" ]]; then base_args+=(-N); fi
if [[ "$db_trust_cert" == "true" ]]; then base_args+=(-C); fi

query_tsv() {
    local output=$1
    local query=$2
    echo "Exporting $output..."
    sqlcmd "${base_args[@]}" -h -1 -W -w 65535 -s $'\t' -Q "SET NOCOUNT ON; $query" > "$source_dir/$output"
}

query_tsv tables.tsv "
SELECT
    s.name,
    t.name,
    COALESCE(CONVERT(nvarchar(200), ep.value), N''),
    COALESCE(SUM(CASE WHEN ps.index_id IN (0, 1) THEN ps.row_count ELSE 0 END), 0)
FROM sys.tables AS t
INNER JOIN sys.schemas AS s ON s.schema_id = t.schema_id
LEFT JOIN sys.dm_db_partition_stats AS ps ON ps.object_id = t.object_id
LEFT JOIN sys.extended_properties AS ep
    ON ep.major_id = t.object_id AND ep.minor_id = 0 AND ep.name = N'MS_Description'
WHERE t.is_ms_shipped = 0
GROUP BY s.name, t.name, CONVERT(nvarchar(200), ep.value)
ORDER BY s.name, t.name;"

query_tsv columns.tsv "
SELECT
    s.name,
    t.name,
    c.column_id,
    c.name,
    ty.name + CASE
        WHEN ty.name IN (N'varchar', N'char', N'varbinary', N'binary')
            THEN N'(' + CASE WHEN c.max_length = -1 THEN N'max' ELSE CONVERT(nvarchar(10), c.max_length) END + N')'
        WHEN ty.name IN (N'nvarchar', N'nchar')
            THEN N'(' + CASE WHEN c.max_length = -1 THEN N'max' ELSE CONVERT(nvarchar(10), c.max_length / 2) END + N')'
        WHEN ty.name IN (N'decimal', N'numeric')
            THEN N'(' + CONVERT(nvarchar(10), c.precision) + N',' + CONVERT(nvarchar(10), c.scale) + N')'
        WHEN ty.name IN (N'datetime2', N'datetimeoffset', N'time')
            THEN N'(' + CONVERT(nvarchar(10), c.scale) + N')'
        ELSE N''
    END,
    CASE WHEN c.is_nullable = 1 THEN N'Yes' ELSE N'No' END,
    CASE WHEN c.is_identity = 1 THEN N'Yes' ELSE N'No' END,
    CASE WHEN c.is_computed = 1 THEN N'Yes' ELSE N'No' END,
    COALESCE(CONVERT(nvarchar(200), dc.definition), N''),
    COALESCE(CONVERT(nvarchar(200), ep.value), N'')
FROM sys.tables AS t
INNER JOIN sys.schemas AS s ON s.schema_id = t.schema_id
INNER JOIN sys.columns AS c ON c.object_id = t.object_id
INNER JOIN sys.types AS ty ON ty.user_type_id = c.user_type_id
LEFT JOIN sys.default_constraints AS dc ON dc.object_id = c.default_object_id
LEFT JOIN sys.extended_properties AS ep
    ON ep.major_id = t.object_id AND ep.minor_id = c.column_id AND ep.name = N'MS_Description'
WHERE t.is_ms_shipped = 0
ORDER BY s.name, t.name, c.column_id;"

query_tsv keys.tsv "
SELECT
    s.name,
    t.name,
    CASE kc.type WHEN N'PK' THEN N'Primary key' ELSE N'Unique key' END,
    kc.name,
    ic.key_ordinal,
    c.name
FROM sys.key_constraints AS kc
INNER JOIN sys.tables AS t ON t.object_id = kc.parent_object_id
INNER JOIN sys.schemas AS s ON s.schema_id = t.schema_id
INNER JOIN sys.index_columns AS ic
    ON ic.object_id = t.object_id AND ic.index_id = kc.unique_index_id
INNER JOIN sys.columns AS c ON c.object_id = t.object_id AND c.column_id = ic.column_id
WHERE t.is_ms_shipped = 0
ORDER BY s.name, t.name, kc.name, ic.key_ordinal;"

query_tsv foreign_keys.tsv "
SELECT
    child_schema.name,
    child_table.name,
    fk.name,
    child_column.name,
    parent_schema.name,
    parent_table.name,
    parent_column.name,
    fk.delete_referential_action_desc,
    fk.update_referential_action_desc
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fkc ON fkc.constraint_object_id = fk.object_id
INNER JOIN sys.tables AS child_table ON child_table.object_id = fk.parent_object_id
INNER JOIN sys.schemas AS child_schema ON child_schema.schema_id = child_table.schema_id
INNER JOIN sys.columns AS child_column
    ON child_column.object_id = child_table.object_id AND child_column.column_id = fkc.parent_column_id
INNER JOIN sys.tables AS parent_table ON parent_table.object_id = fk.referenced_object_id
INNER JOIN sys.schemas AS parent_schema ON parent_schema.schema_id = parent_table.schema_id
INNER JOIN sys.columns AS parent_column
    ON parent_column.object_id = parent_table.object_id AND parent_column.column_id = fkc.referenced_column_id
ORDER BY child_schema.name, child_table.name, fk.name, fkc.constraint_column_id;"

query_tsv indexes.tsv "
SELECT
    s.name,
    t.name,
    i.name,
    CASE WHEN i.is_unique = 1 THEN N'Yes' ELSE N'No' END,
    i.type_desc,
    ic.index_column_id,
    c.name,
    CASE WHEN ic.is_included_column = 1 THEN N'Yes' ELSE N'No' END
FROM sys.indexes AS i
INNER JOIN sys.tables AS t ON t.object_id = i.object_id
INNER JOIN sys.schemas AS s ON s.schema_id = t.schema_id
INNER JOIN sys.index_columns AS ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
INNER JOIN sys.columns AS c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE t.is_ms_shipped = 0
  AND i.is_hypothetical = 0
  AND i.is_primary_key = 0
  AND i.is_unique_constraint = 0
ORDER BY s.name, t.name, i.name, ic.index_column_id;"

query_tsv checks.tsv "
SELECT
    s.name,
    t.name,
    cc.name,
    CONVERT(nvarchar(500), cc.definition)
FROM sys.check_constraints AS cc
INNER JOIN sys.tables AS t ON t.object_id = cc.parent_object_id
INNER JOIN sys.schemas AS s ON s.schema_id = t.schema_id
WHERE t.is_ms_shipped = 0
ORDER BY s.name, t.name, cc.name;"

echo "Exporting samples..."
if ! sqlcmd "${base_args[@]}" -h -1 -W -w 65535 -s $'\t' -i "$script_dir/export_samples.sql" > "$source_dir/samples.txt"; then
    tail -n 40 "$source_dir/samples.txt" >&2
    exit 1
fi

echo "Writing Markdown documentation..."
ruby "$script_dir/generate_docs.rb" "$source_dir" "$workspace/database/$database_name" "$database_name"
echo "Documentation generated."
