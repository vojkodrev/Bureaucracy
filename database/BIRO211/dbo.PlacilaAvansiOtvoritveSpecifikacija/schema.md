# `dbo`.`PlacilaAvansiOtvoritveSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `NeUpostevajZaDDV` | `smallint` | Yes | No | No | `` |  |
| 2 | `OznakaLeta` | `nvarchar(5)` | Yes | No | No | `` |  |
| 3 | `Partner` | `nvarchar(10)` | Yes | No | No | `` |  |
| 4 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `StevilkaPlacila` | `smallint` | Yes | No | No | `` |  |
| 7 | `VD` | `nvarchar(5)` | Yes | No | No | `` |  |
| 8 | `VDOpis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `StevilkaPlacila` | No | NONCLUSTERED | 1 | `StevilkaPlacila` | No |

## Check constraints

_None._
