# `dbo`.`ODObracunaniOdbitki`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Boniteta` | `smallint` | Yes | No | No | `` |  |
| 2 | `DatumObracuna` | `datetime` | Yes | No | No | `` |  |
| 3 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 4 | `OD` | `smallint` | Yes | No | No | `` |  |
| 5 | `Oznaka` | `nvarchar(6)` | Yes | No | No | `` |  |
| 6 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `ProcentOdbitkaOdBruto` | `float` | Yes | No | No | `` |  |
| 8 | `ProcentOdbitkaOdNeto` | `float` | Yes | No | No | `` |  |
| 9 | `RecNo` | `int` | No | Yes | No | `` |  |
| 10 | `VBremeKoga` | `nvarchar(14)` | Yes | No | No | `` |  |
| 11 | `Vrsta` | `smallint` | Yes | No | No | `` |  |
| 12 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `OD` | No | NONCLUSTERED | 1 | `OD` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
