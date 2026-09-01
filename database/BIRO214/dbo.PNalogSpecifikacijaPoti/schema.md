# `dbo`.`PNalogSpecifikacijaPoti`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatPot` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatVrn` | `datetime` | Yes | No | No | `` |  |
| 3 | `Drzava` | `nvarchar(5)` | Yes | No | No | `` |  |
| 4 | `Enosmerno` | `smallint` | Yes | No | No | `` |  |
| 5 | `ImePoti` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `KM` | `float` | Yes | No | No | `` |  |
| 7 | `Naloga` | `ntext` | Yes | No | No | `` |  |
| 8 | `ObracunajDnevnico` | `smallint` | Yes | No | No | `` |  |
| 9 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `PN` | `float` | Yes | No | No | `` |  |
| 11 | `Pot` | `nvarchar(5)` | Yes | No | No | `` |  |
| 12 | `ProcentDnevnice` | `float` | Yes | No | No | `` |  |
| 13 | `RazlogProcentaDnevnice` | `nvarchar(30)` | Yes | No | No | `` |  |
| 14 | `RecNo` | `int` | No | Yes | No | `` |  |
| 15 | `Ura1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 16 | `Ura2` | `nvarchar(5)` | Yes | No | No | `` |  |

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
