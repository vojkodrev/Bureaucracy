# `dbo`.`Inventura`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumOriginalni` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 5 | `ObracunZaloge` | `smallint` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 8 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 9 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 10 | `VrstaInventure` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
