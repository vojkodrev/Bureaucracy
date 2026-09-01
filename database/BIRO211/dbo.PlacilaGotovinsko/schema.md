# `dbo`.`PlacilaGotovinsko`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumKnjizenja` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumPrispetja` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumRacuna` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumStoritveOdpreme` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 6 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 7 | `GK` | `smallint` | Yes | No | No | `` |  |
| 8 | `NacinNakazila` | `smallint` | Yes | No | No | `` |  |
| 9 | `NamenNakazila1` | `nvarchar(40)` | Yes | No | No | `` |  |
| 10 | `NamenNakazila2` | `nvarchar(40)` | Yes | No | No | `` |  |
| 11 | `NeUpostevajZaDDV` | `smallint` | Yes | No | No | `` |  |
| 12 | `ObracunDDV` | `smallint` | Yes | No | No | `` |  |
| 13 | `Opombe` | `ntext` | Yes | No | No | `` |  |
| 14 | `OznakaMaloprodaje` | `nvarchar(2)` | Yes | No | No | `` |  |
| 15 | `Partner` | `nvarchar(10)` | Yes | No | No | `` |  |
| 16 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 17 | `RecNo` | `int` | No | Yes | No | `` |  |
| 18 | `StevilkaDokumenta` | `nvarchar(20)` | Yes | No | No | `` |  |
| 19 | `StevilkaPlacila` | `smallint` | Yes | No | No | `` |  |
| 20 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 21 | `VD` | `nvarchar(5)` | Yes | No | No | `` |  |
| 22 | `VdobroRacuna` | `nvarchar(60)` | Yes | No | No | `` |  |
| 23 | `Vdobroracuna2` | `nvarchar(40)` | Yes | No | No | `` |  |
| 24 | `VDOpis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 25 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 26 | `Zaokrozevanje` | `float` | Yes | No | No | `` |  |
| 27 | `Znesek` | `float` | Yes | No | No | `` |  |
| 28 | `ZnesekDDV` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `DatumPrispetja` | No | NONCLUSTERED | 1 | `DatumPrispetja` | No |
| `DatumPrispetja` | No | NONCLUSTERED | 2 | `StevilkaPlacila` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `StevilkaPlacila` | No | NONCLUSTERED | 1 | `StevilkaPlacila` | No |

## Check constraints

_None._
