# `dbo`.`PlacilaVTujinoAvansi`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumValute` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 6 | `GK` | `smallint` | Yes | No | No | `` |  |
| 7 | `GK1` | `smallint` | Yes | No | No | `` |  |
| 8 | `KoncniTecajValute` | `float` | Yes | No | No | `` |  |
| 9 | `NacinIzvrstivePlacila` | `nvarchar(100)` | Yes | No | No | `` |  |
| 10 | `NalogStev` | `nvarchar(20)` | Yes | No | No | `` |  |
| 11 | `NaslovVDobro` | `nvarchar(100)` | Yes | No | No | `` |  |
| 12 | `NePlacano` | `float` | Yes | No | No | `` |  |
| 13 | `NeplacanoProtivrednost` | `float` | Yes | No | No | `` |  |
| 14 | `ObracunDDV` | `smallint` | Yes | No | No | `` |  |
| 15 | `OpisTransakcije1` | `nvarchar(40)` | Yes | No | No | `` |  |
| 16 | `OpisTransakcije2` | `nvarchar(40)` | Yes | No | No | `` |  |
| 17 | `OpisTransakcije3` | `nvarchar(40)` | Yes | No | No | `` |  |
| 18 | `OpisTransakcije4` | `nvarchar(40)` | Yes | No | No | `` |  |
| 19 | `OznakaValute` | `nvarchar(3)` | Yes | No | No | `` |  |
| 20 | `Partner` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 22 | `Placano` | `float` | Yes | No | No | `` |  |
| 23 | `PlacanoProtivrednost` | `float` | Yes | No | No | `` |  |
| 24 | `Pri` | `nvarchar(100)` | Yes | No | No | `` |  |
| 25 | `Provizija` | `float` | Yes | No | No | `` |  |
| 26 | `RecNo` | `int` | No | Yes | No | `` |  |
| 27 | `RegStKredita` | `nvarchar(10)` | Yes | No | No | `` |  |
| 28 | `RegStKredita1` | `nvarchar(10)` | Yes | No | No | `` |  |
| 29 | `RegStKredita2` | `nvarchar(10)` | Yes | No | No | `` |  |
| 30 | `RegStKredita3` | `nvarchar(10)` | Yes | No | No | `` |  |
| 31 | `RegStKredita4` | `nvarchar(10)` | Yes | No | No | `` |  |
| 32 | `SIfraOsnove1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 33 | `SifraOsnove2` | `nvarchar(5)` | Yes | No | No | `` |  |
| 34 | `SifraOsnove3` | `nvarchar(5)` | Yes | No | No | `` |  |
| 35 | `SifraOsnove4` | `nvarchar(5)` | Yes | No | No | `` |  |
| 36 | `SifraPri1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 37 | `SifraPri2` | `nvarchar(10)` | Yes | No | No | `` |  |
| 38 | `SifraValute` | `nvarchar(3)` | Yes | No | No | `` |  |
| 39 | `SifraVDobro` | `nvarchar(5)` | Yes | No | No | `` |  |
| 40 | `SkupniZnesekVValuti` | `float` | Yes | No | No | `` |  |
| 41 | `Specifikacija1` | `float` | Yes | No | No | `` |  |
| 42 | `Specifikacija2` | `float` | Yes | No | No | `` |  |
| 43 | `Specifikacija3` | `float` | Yes | No | No | `` |  |
| 44 | `Specifikacija4` | `float` | Yes | No | No | `` |  |
| 45 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 46 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 47 | `TextNaloga` | `ntext` | Yes | No | No | `` |  |
| 48 | `VD` | `nvarchar(5)` | Yes | No | No | `` |  |
| 49 | `VD1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 50 | `VD2` | `nvarchar(5)` | Yes | No | No | `` |  |
| 51 | `VD3` | `nvarchar(5)` | Yes | No | No | `` |  |
| 52 | `VDobro` | `nvarchar(100)` | Yes | No | No | `` |  |
| 53 | `VDOpis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 54 | `VDOpis1` | `nvarchar(50)` | Yes | No | No | `` |  |
| 55 | `VDOpis2` | `nvarchar(50)` | Yes | No | No | `` |  |
| 56 | `VDOpis3` | `nvarchar(50)` | Yes | No | No | `` |  |
| 57 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 58 | `VnesenaPlacila` | `float` | Yes | No | No | `` |  |
| 59 | `VnesenaPlacilaProtivrednost` | `float` | Yes | No | No | `` |  |
| 60 | `ZnesekDDV` | `float` | Yes | No | No | `` |  |
| 61 | `ZnesekDDV1` | `float` | Yes | No | No | `` |  |
| 62 | `ZnesekDDV2` | `float` | Yes | No | No | `` |  |
| 63 | `ZnesekDDV3` | `float` | Yes | No | No | `` |  |
| 64 | `ZnesekProvizije` | `float` | Yes | No | No | `` |  |
| 65 | `ZnesekVSIT` | `float` | Yes | No | No | `` |  |
| 66 | `ZnesekVSITIzvrseno` | `float` | Yes | No | No | `` |  |
| 67 | `ZRbanka` | `nvarchar(60)` | Yes | No | No | `` |  |
| 68 | `ZValutoOd` | `nvarchar(10)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `StevilkaPlacila` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
