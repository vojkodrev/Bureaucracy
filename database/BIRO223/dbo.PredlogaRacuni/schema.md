# `dbo`.`PredlogaRacuni`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumDUR` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 5 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 6 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 7 | `KrajIzdaje` | `nvarchar(30)` | Yes | No | No | `` |  |
| 8 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 9 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 11 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 12 | `RecNo` | `int` | No | Yes | No | `` |  |
| 13 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 14 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 15 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 16 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 17 | `Vrsta` | `smallint` | Yes | No | No | `` |  |
| 18 | `VrstaPredracuna` | `smallint` | Yes | No | No | `` |  |
| 19 | `Znesek` | `float` | Yes | No | No | `` |  |

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
