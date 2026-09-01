# `dbo`.`ODVodiloSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Kljuc` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `Leto` | `smallint` | Yes | No | No | `` |  |
| 3 | `Mesec` | `smallint` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `Vrednost` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `MesecLeto` | No | NONCLUSTERED | 1 | `Mesec` | No |
| `MesecLeto` | No | NONCLUSTERED | 2 | `Leto` | No |
| `MesecLeto` | No | NONCLUSTERED | 3 | `Kljuc` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
