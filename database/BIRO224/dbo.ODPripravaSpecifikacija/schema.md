# `dbo`.`ODPripravaSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `MesecObracuna` | `datetime` | Yes | No | No | `` |  |
| 2 | `RecNo` | `int` | No | Yes | No | `` |  |
| 3 | `SifraDela` | `nvarchar(3)` | Yes | No | No | `` |  |
| 4 | `SteviloUr` | `decimal(12,6)` | Yes | No | No | `` |  |
| 5 | `Zaposleni` | `nvarchar(4)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
