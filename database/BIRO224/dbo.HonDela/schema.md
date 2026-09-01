# `dbo`.`HonDela`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 3 | `FaktorPribitka` | `decimal(12,6)` | Yes | No | No | `` |  |
| 4 | `OdbitekOdBruta` | `smallint` | Yes | No | No | `` |  |
| 5 | `OpisDela` | `nvarchar(40)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `Refundacija` | `smallint` | Yes | No | No | `` |  |
| 8 | `RefundacijaOd` | `nvarchar(6)` | Yes | No | No | `` |  |
| 9 | `Sifra` | `smallint` | Yes | No | No | `` |  |
| 10 | `SifraDela` | `nvarchar(3)` | Yes | No | No | `` |  |
| 11 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | No | NONCLUSTERED | 1 | `Sifra` | No |
| `SifraDela` | Yes | NONCLUSTERED | 1 | `SifraDela` | No |

## Check constraints

_None._
