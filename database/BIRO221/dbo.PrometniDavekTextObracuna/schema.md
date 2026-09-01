# `dbo`.`PrometniDavekTextObracuna`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `DatumPlacila` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `Davek` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 5 | `Dogodek` | `nvarchar(150)` | Yes | No | No | `` |  |
| 6 | `Nabava` | `smallint` | Yes | No | No | `` |  |
| 7 | `NabavnaCena` | `nvarchar(50)` | Yes | No | No | `` |  |
| 8 | `Najden` | `smallint` | Yes | No | No | `` |  |
| 9 | `OsnovaZaDavek` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `ST` | `nvarchar(20)` | Yes | No | No | `` |  |
| 12 | `StevilkaObracuna` | `smallint` | Yes | No | No | `` |  |
| 13 | `Zaporedje` | `int` | Yes | No | No | `` |  |
| 14 | `Znesek` | `nvarchar(50)` | Yes | No | No | `` |  |

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
