# `dbo`.`ObracunObrestiAllSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumRacuna` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 4 | `ObracunanoDo` | `datetime` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 7 | `StevilkaRacuna` | `nvarchar(10)` | Yes | No | No | `` |  |
| 8 | `SteviloDniZamude` | `smallint` | Yes | No | No | `` |  |
| 9 | `ZnesekZaObracun` | `float` | Yes | No | No | `` |  |

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
