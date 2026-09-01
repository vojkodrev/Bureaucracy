# `dbo`.`HonObracunanaDela`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Komentar` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `OD` | `smallint` | Yes | No | No | `` |  |
| 3 | `OpisDela` | `nvarchar(40)` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `Sifra` | `smallint` | Yes | No | No | `` |  |
| 6 | `Ure` | `decimal(12,6)` | Yes | No | No | `` |  |

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
