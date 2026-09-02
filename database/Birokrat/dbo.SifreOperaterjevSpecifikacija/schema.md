# `dbo`.`SifreOperaterjevSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Recno` | `int` | No | Yes | No | `` |  |
| 2 | `Lastnost` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `Operater` | `nvarchar(20)` | Yes | No | No | `` |  |
| 4 | `Vrednost` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Lastnost` | Yes | NONCLUSTERED | 1 | `Operater` | No |
| `Lastnost` | Yes | NONCLUSTERED | 2 | `Lastnost` | No |

## Check constraints

_None._
