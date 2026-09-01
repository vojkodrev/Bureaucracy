# `dbo`.`PoljubniSifrant`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `Naziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `Oznaka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `Skupina` | `nvarchar(15)` | Yes | No | No | `` |  |
| 6 | `Vnasalec` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `PrimaryKey` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
