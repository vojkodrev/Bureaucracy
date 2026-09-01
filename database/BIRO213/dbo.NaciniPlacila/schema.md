# `dbo`.`NaciniPlacila`

_No table description is defined in MSSQL._

- Rows: 13
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Banka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `KreditnaKartica` | `smallint` | Yes | No | No | `` |  |
| 3 | `NacinPlacila` | `float` | Yes | No | No | `` |  |
| 4 | `Onemogoceno` | `smallint` | Yes | No | No | `` |  |
| 5 | `OpisNacinaPlacila` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `SteviloKopij` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `NacinPlacila` | Yes | NONCLUSTERED | 1 | `NacinPlacila` | No |
| `PrimaryKey` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
