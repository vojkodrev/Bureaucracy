# `dbo`.`NalogiDela`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CenaBrezDavka` | `float` | Yes | No | No | `` |  |
| 2 | `CenaZDavkom` | `float` | Yes | No | No | `` |  |
| 3 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 4 | `Delavec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 6 | `DN` | `smallint` | Yes | No | No | `` |  |
| 7 | `Komentar` | `nvarchar(50)` | Yes | No | No | `` |  |
| 8 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 9 | `OpisDela` | `nvarchar(40)` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `SifraDavka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 12 | `SifraDela` | `nvarchar(3)` | Yes | No | No | `` |  |
| 13 | `Stevilka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 14 | `Ure` | `decimal(12,6)` | Yes | No | No | `` |  |
| 15 | `Vrednost` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `OD` | No | NONCLUSTERED | 1 | `DN` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
