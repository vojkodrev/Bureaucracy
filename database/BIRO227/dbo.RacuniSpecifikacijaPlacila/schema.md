# `dbo`.`RacuniSpecifikacijaPlacila`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `NacinPlacila` | `smallint` | Yes | No | No | `` |  |
| 2 | `RecNo` | `int` | No | Yes | No | `` |  |
| 3 | `StevilkaRacuna` | `nvarchar(10)` | Yes | No | No | `` |  |
| 4 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `StevilkaRacuna` | No |

## Check constraints

_None._
