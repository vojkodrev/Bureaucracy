# `dbo`.`ZakljucnicaDela`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `ArtikelGotovi` | `nvarchar(13)` | Yes | No | No | `` |  |
| 2 | `CenaBrezDavka` | `float` | Yes | No | No | `` |  |
| 3 | `CenaZDavkom` | `float` | Yes | No | No | `` |  |
| 4 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 5 | `Delavec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 7 | `DN` | `smallint` | Yes | No | No | `` |  |
| 8 | `Komentar` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `OpisDela` | `nvarchar(40)` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `SifraDavka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 13 | `SifraDela` | `nvarchar(3)` | Yes | No | No | `` |  |
| 14 | `Stevilka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 15 | `Ure` | `decimal(12,6)` | Yes | No | No | `` |  |
| 16 | `Vrednost` | `float` | Yes | No | No | `` |  |
| 17 | `Zaporedje` | `smallint` | Yes | No | No | `` |  |

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
