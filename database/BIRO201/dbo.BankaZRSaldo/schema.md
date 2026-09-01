# `dbo`.`BankaZRSaldo`

_No table description is defined in MSSQL._

- Rows: 288
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 3 | `GK` | `smallint` | Yes | No | No | `` |  |
| 4 | `Racun` | `nvarchar(3)` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `SaldoBreme` | `float` | Yes | No | No | `` |  |
| 7 | `SaldoDobro` | `float` | Yes | No | No | `` |  |
| 8 | `Stevilka` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
