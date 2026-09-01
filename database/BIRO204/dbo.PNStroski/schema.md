# `dbo`.`PNStroski`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `PN` | `float` | Yes | No | No | `` |  |
| 3 | `Pot` | `nvarchar(5)` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `Strosek` | `ntext` | Yes | No | No | `` |  |
| 6 | `VD` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `PN` | No | NONCLUSTERED | 1 | `PN` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
