# `dbo`.`BlagajnaSaldo`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 3 | `GK` | `smallint` | Yes | No | No | `` |  |
| 4 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 5 | `OznakaBlagajne` | `nvarchar(2)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `SaldoBreme` | `float` | Yes | No | No | `` |  |
| 8 | `SaldoDobro` | `float` | Yes | No | No | `` |  |
| 9 | `Stevilka` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
