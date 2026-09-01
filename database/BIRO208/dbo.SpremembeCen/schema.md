# `dbo`.`SpremembeCen`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `GK` | `smallint` | Yes | No | No | `` |  |
| 3 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 4 | `PCBrezPD` | `float` | Yes | No | No | `` |  |
| 5 | `PCPD` | `float` | Yes | No | No | `` |  |
| 6 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `Datum` | No | NONCLUSTERED | 2 | `MPO` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
