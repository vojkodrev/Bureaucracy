# `dbo`.`InventuraSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CETRTI` | `float` | Yes | No | No | `` |  |
| 2 | `DATUM` | `datetime` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `DRUGI` | `float` | Yes | No | No | `` |  |
| 5 | `ENOTA` | `nvarchar(3)` | Yes | No | No | `` |  |
| 6 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 7 | `NovaCena` | `float` | Yes | No | No | `` |  |
| 8 | `OTVORITEV` | `float` | Yes | No | No | `` |  |
| 9 | `PETI` | `float` | Yes | No | No | `` |  |
| 10 | `PRVI` | `float` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `SIFRA` | `nvarchar(25)` | Yes | No | No | `` |  |
| 13 | `StaraCena` | `float` | Yes | No | No | `` |  |
| 14 | `STEVILKA` | `nvarchar(5)` | Yes | No | No | `` |  |
| 15 | `TRETJI` | `float` | Yes | No | No | `` |  |
| 16 | `URA` | `float` | Yes | No | No | `` |  |

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
