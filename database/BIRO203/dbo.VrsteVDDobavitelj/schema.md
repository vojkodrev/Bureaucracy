# `dbo`.`VrsteVDDobavitelj`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Ime` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `RecNo` | `int` | No | Yes | No | `` |  |
| 4 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Ime` | Yes | NONCLUSTERED | 1 | `Ime` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
