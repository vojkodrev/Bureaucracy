# `dbo`.`ODDela`

_No table description is defined in MSSQL._

- Rows: 9
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `DodatekNaBruto` | `float` | Yes | No | No | `` |  |
| 3 | `FaktorPribitka` | `decimal(12,6)` | Yes | No | No | `` |  |
| 4 | `Nadomestilo` | `smallint` | Yes | No | No | `` |  |
| 5 | `OdbitekOdBruta` | `smallint` | Yes | No | No | `` |  |
| 6 | `OpisDela` | `nvarchar(40)` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `Refundacija` | `smallint` | Yes | No | No | `` |  |
| 9 | `RefundacijaOd` | `nvarchar(6)` | Yes | No | No | `` |  |
| 10 | `Sifra` | `smallint` | Yes | No | No | `` |  |
| 11 | `SifraDela` | `nvarchar(3)` | Yes | No | No | `` |  |
| 12 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | No | NONCLUSTERED | 1 | `Sifra` | No |
| `SifraDela` | No | NONCLUSTERED | 1 | `SifraDela` | No |

## Check constraints

_None._
