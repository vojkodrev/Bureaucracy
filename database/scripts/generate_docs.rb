require 'csv'
require 'fileutils'

source_dir, output_dir, database = ARGV

def read_tsv(path)
    CSV.read(path, col_sep: "\t", headers: false, liberal_parsing: true)
end

def text(value)
    value.to_s.gsub('|', '\\|').gsub(/\r?\n/, ' ').strip
end

def code(value)
    "`#{text(value).gsub('`', '\\`')}`"
end

tables = read_tsv(File.join(source_dir, 'tables.tsv'))
columns = read_tsv(File.join(source_dir, 'columns.tsv')).group_by { |row| row.values_at(0, 1) }
keys = read_tsv(File.join(source_dir, 'keys.tsv')).group_by { |row| row.values_at(0, 1) }
foreign_keys = read_tsv(File.join(source_dir, 'foreign_keys.tsv')).group_by { |row| row.values_at(0, 1) }
indexes = read_tsv(File.join(source_dir, 'indexes.tsv')).group_by { |row| row.values_at(0, 1) }
checks = read_tsv(File.join(source_dir, 'checks.tsv')).group_by { |row| row.values_at(0, 1) }

samples = {}
current_key = nil
current_count = nil
current_rows = {}
current_error = nil

File.foreach(File.join(source_dir, 'samples.txt'), chomp: true) do |line|
    line = line.delete_suffix("\r").strip
    line = line.sub(/\A\[Microsoft\]\[ODBC Driver 18 for SQL Server\]\[SQL Server\]/, '')
    case line
    when /\A@@TABLE\t([^\t]+)\t(.+)\z/
        current_key = [Regexp.last_match(1), Regexp.last_match(2)]
        current_count = nil
        current_rows = {}
        current_error = nil
    when /\A@@COUNT\t(\d+)\z/
        current_count = Regexp.last_match(1).to_i
    when /\A@@ERROR\t(.*)\z/
        current_error = Regexp.last_match(1)
    when '@@END'
        samples[current_key] = { count: current_count, rows: current_rows.sort.map(&:last), error: current_error }
        current_key = nil
    else
        if current_key && !line.empty?
            row_number, column_name, value = line.split("\t", 3)
            if row_number&.match?(/\A\d+\z/) && column_name
                current_rows[row_number.to_i] ||= {}
                current_rows[row_number.to_i][column_name] = value == '@@NULL' ? nil : value.to_s
            end
        end
    end
end

FileUtils.mkdir_p(output_dir)
index_rows = []

tables.each do |table|
    schema_name, table_name, description, row_count = table
    key = [schema_name, table_name]
    folder_name = "#{schema_name}.#{table_name}".gsub(/[^A-Za-z0-9._-]/, '_')
    table_dir = File.join(output_dir, folder_name)
    FileUtils.mkdir_p(table_dir)
    filename = File.join(folder_name, 'schema.md')
    data_filename = File.join(folder_name, 'data.md')
    sample = samples.fetch(key, { count: row_count.to_i, rows: [], error: 'Sample export was unavailable.' })
    exact_count = sample[:count]
    index_rows << [schema_name, table_name, filename, data_filename, exact_count]

    lines = []
    lines << "# #{code(schema_name)}.#{code(table_name)}"
    lines << ''
    lines << (description.to_s.empty? ? '_No table description is defined in MSSQL._' : text(description))
    lines << ''
    lines << "- Rows: #{exact_count}"
    lines << '- Sample data: [Open](data.md)'
    lines << ''
    lines << '## Columns'
    lines << ''
    lines << '| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |'
    lines << '|---:|---|---|:---:|:---:|:---:|---|---|'
    (columns[key] || []).each do |column|
        _, _, ordinal, name, sql_type, nullable, identity, computed, default_value, column_description = column
        lines << "| #{ordinal} | #{code(name)} | #{code(sql_type)} | #{nullable} | #{identity} | #{computed} | #{code(default_value)} | #{text(column_description)} |"
    end

    lines << ''
    lines << '## Primary and unique keys'
    lines << ''
    table_keys = keys[key] || []
    if table_keys.empty?
        lines << '_None._'
    else
        lines << '| Kind | Constraint | Position | Column |'
        lines << '|---|---|---:|---|'
        table_keys.each do |entry|
            _, _, kind, constraint, position, column = entry
            lines << "| #{text(kind)} | #{code(constraint)} | #{position} | #{code(column)} |"
        end
    end

    lines << ''
    lines << '## Foreign keys'
    lines << ''
    table_foreign_keys = foreign_keys[key] || []
    if table_foreign_keys.empty?
        lines << '_None._'
    else
        lines << '| Constraint | Column | References | Delete | Update |'
        lines << '|---|---|---|---|---|'
        table_foreign_keys.each do |entry|
            _, _, constraint, column, referenced_schema, referenced_table, referenced_column, delete_action, update_action = entry
            reference = "#{code(referenced_schema)}.#{code(referenced_table)}.#{code(referenced_column)}"
            lines << "| #{code(constraint)} | #{code(column)} | #{reference} | #{text(delete_action)} | #{text(update_action)} |"
        end
    end

    lines << ''
    lines << '## Other indexes'
    lines << ''
    table_indexes = indexes[key] || []
    if table_indexes.empty?
        lines << '_None._'
    else
        lines << '| Index | Unique | Type | Position | Column | Included |'
        lines << '|---|:---:|---|---:|---|:---:|'
        table_indexes.each do |entry|
            _, _, index_name, unique, index_type, position, column, included = entry
            lines << "| #{code(index_name)} | #{unique} | #{text(index_type)} | #{position} | #{code(column)} | #{included} |"
        end
    end

    lines << ''
    lines << '## Check constraints'
    lines << ''
    table_checks = checks[key] || []
    if table_checks.empty?
        lines << '_None._'
    else
        table_checks.each do |entry|
            _, _, constraint, definition = entry
            lines << "- #{code(constraint)}: #{code(definition)}"
        end
    end
    lines << ''

    File.write(File.join(table_dir, 'schema.md'), lines.join("\n"))

    data_lines = []
    data_lines << "# Sample data for #{code(schema_name)}.#{code(table_name)}"
    data_lines << ''
    data_lines << "- Total rows: #{exact_count}"
    data_lines << "- Rows shown: #{sample[:rows].length}"
    data_lines << '- Values are limited to 200 characters; binary values show their byte size.'
    data_lines << ''

    if sample[:error]
        data_lines << "_Sample unavailable: #{text(sample[:error])}_"
    elsif sample[:rows].empty?
        data_lines << '_The table contains no sample rows._'
    else
        headers = sample[:rows].flat_map(&:keys).uniq
        data_lines << "| #{headers.map { |header| text(header) }.join(' | ')} |"
        data_lines << "| #{headers.map { '---' }.join(' | ')} |"
        sample[:rows].each do |row|
            values = headers.map do |header|
                value = row[header]
                value.nil? ? '_NULL_' : text(value)
            end
            data_lines << "| #{values.join(' | ')} |"
        end
    end
    data_lines << ''

    File.write(File.join(table_dir, 'data.md'), data_lines.join("\n"))
end

readme = [
    "# #{database} schema documentation",
    '',
    'Generated from MSSQL system catalogs. Each table has a separate documentation file.',
    '',
    "- Tables: #{tables.length}",
    '',
    '| Schema | Table | Rows | Structure | Sample data |',
    '|---|---|---:|---|---|',
]

index_rows.each do |schema_name, table_name, filename, data_filename, row_count|
    readme << "| #{code(schema_name)} | #{code(table_name)} | #{row_count} | [Open](#{filename}) | [Open](#{data_filename}) |"
end
readme << ''

File.write(File.join(output_dir, 'README.md'), readme.join("\n"))
