# `dbo`.`ODDohodninskaLestvica`

_No table description is defined in MSSQL._

- Rows: 5
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Meja1` | `decimal(12,6)` | Yes | No | No | `` |  |
| 3 | `Meja1SIT` | `float` | Yes | No | No | `` |  |
| 4 | `Meja2` | `decimal(12,6)` | Yes | No | No | `` |  |
| 5 | `Meja2SIT` | `float` | Yes | No | No | `` |  |
| 6 | `Procent` | `decimal(12,6)` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Meja1` | No | NONCLUSTERED | 1 | `Meja1` | No |
| `Procent` | Yes | NONCLUSTERED | 1 | `Procent` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
