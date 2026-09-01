# `dbo`.`VrsteArtiklov`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Ime` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `Rabat1` | `float` | Yes | No | No | `` |  |
| 4 | `Rabat2` | `float` | Yes | No | No | `` |  |
| 5 | `Rabat3` | `float` | Yes | No | No | `` |  |
| 6 | `Rabat4` | `float` | Yes | No | No | `` |  |
| 7 | `Rabat5` | `float` | Yes | No | No | `` |  |
| 8 | `Rabat6` | `float` | Yes | No | No | `` |  |
| 9 | `Rabat7` | `float` | Yes | No | No | `` |  |
| 10 | `Rabat8` | `float` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `Skupina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Ime` | Yes | NONCLUSTERED | 1 | `Skupina` | No |
| `Ime` | Yes | NONCLUSTERED | 2 | `Ime` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
