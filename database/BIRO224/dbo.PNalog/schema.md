# `dbo`.`PNalog`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CESTNINA` | `float` | Yes | No | No | `` |  |
| 2 | `DatPot` | `datetime` | Yes | No | No | `` |  |
| 3 | `DATUM` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumObracuna` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 6 | `DatVrn` | `datetime` | Yes | No | No | `` |  |
| 7 | `DELO` | `nvarchar(32)` | Yes | No | No | `` |  |
| 8 | `DNEV1224` | `float` | Yes | No | No | `` |  |
| 9 | `DNEV68` | `float` | Yes | No | No | `` |  |
| 10 | `DNEV812` | `float` | Yes | No | No | `` |  |
| 11 | `Drzava` | `nvarchar(3)` | Yes | No | No | `` |  |
| 12 | `GK` | `smallint` | Yes | No | No | `` |  |
| 13 | `HON` | `smallint` | Yes | No | No | `` |  |
| 14 | `IME` | `nvarchar(50)` | Yes | No | No | `` |  |
| 15 | `ImePoti` | `nvarchar(50)` | Yes | No | No | `` |  |
| 16 | `Izdatek` | `smallint` | Yes | No | No | `` |  |
| 17 | `KM` | `float` | Yes | No | No | `` |  |
| 18 | `KM500` | `float` | Yes | No | No | `` |  |
| 19 | `KoncnoStanjeStevca` | `int` | Yes | No | No | `` |  |
| 20 | `Naloga` | `nvarchar(255)` | Yes | No | No | `` |  |
| 21 | `NASLOV` | `nvarchar(54)` | Yes | No | No | `` |  |
| 22 | `OBRACUN` | `smallint` | Yes | No | No | `` |  |
| 23 | `OD` | `smallint` | Yes | No | No | `` |  |
| 24 | `PE` | `nvarchar(25)` | Yes | No | No | `` |  |
| 25 | `Pot` | `nvarchar(5)` | Yes | No | No | `` |  |
| 26 | `Predujem` | `float` | Yes | No | No | `` |  |
| 27 | `PrevoznoSredstvo` | `smallint` | Yes | No | No | `` |  |
| 28 | `RecNo` | `int` | No | Yes | No | `` |  |
| 29 | `Registracija` | `nvarchar(40)` | Yes | No | No | `` |  |
| 30 | `SamoVEnoSmer` | `smallint` | Yes | No | No | `` |  |
| 31 | `STATUS` | `nvarchar(1)` | Yes | No | No | `` |  |
| 32 | `StDnev1224` | `smallint` | Yes | No | No | `` |  |
| 33 | `StDnev68` | `smallint` | Yes | No | No | `` |  |
| 34 | `STDnev812` | `smallint` | Yes | No | No | `` |  |
| 35 | `STEVILKA` | `float` | Yes | No | No | `` |  |
| 36 | `Stroski` | `float` | Yes | No | No | `` |  |
| 37 | `StTujeDnev1224` | `smallint` | Yes | No | No | `` |  |
| 38 | `StTujeDnev68` | `smallint` | Yes | No | No | `` |  |
| 39 | `StTujeDnev812` | `smallint` | Yes | No | No | `` |  |
| 40 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 41 | `TempIzbira` | `smallint` | Yes | No | No | `` |  |
| 42 | `TUJEDNEV1224` | `float` | Yes | No | No | `` |  |
| 43 | `TUJEDNEV68` | `float` | Yes | No | No | `` |  |
| 44 | `TUJEDNEV812` | `float` | Yes | No | No | `` |  |
| 45 | `Ura1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 46 | `Ura2` | `nvarchar(5)` | Yes | No | No | `` |  |
| 47 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 48 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 49 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 50 | `ZacetnoStanjeStevca` | `int` | Yes | No | No | `` |  |
| 51 | `ZNESEKKM` | `float` | Yes | No | No | `` |  |
| 52 | `ZNESEKKM500` | `float` | Yes | No | No | `` |  |
| 53 | `ZR` | `int` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `STEVILKA` | No |

## Check constraints

_None._
