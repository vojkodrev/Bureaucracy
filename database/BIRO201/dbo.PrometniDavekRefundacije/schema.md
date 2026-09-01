# `dbo`.`PrometniDavekRefundacije`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumObracuna` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 5 | `OpisDavka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `Oznaka` | `smallint` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `SifraDavka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `StevilkaObracuna` | `smallint` | Yes | No | No | `` |  |
| 10 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 11 | `Znesek` | `float` | Yes | No | No | `` |  |
| 12 | `ZnesekRefundacije` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
