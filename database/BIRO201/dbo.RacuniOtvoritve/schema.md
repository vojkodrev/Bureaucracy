# `dbo`.`RacuniOtvoritve`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumDUR` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumZaObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 8 | `DavekPlacanVPreteklemletu` | `smallint` | Yes | No | No | `` |  |
| 9 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 10 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 11 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 12 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 13 | `KoncniTecajValute` | `float` | Yes | No | No | `` |  |
| 14 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 15 | `Narocilnica` | `nvarchar(150)` | Yes | No | No | `` |  |
| 16 | `ObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 17 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 18 | `OriginalStevilka` | `nvarchar(4)` | Yes | No | No | `` |  |
| 19 | `OznakaLeta` | `nvarchar(2)` | Yes | No | No | `` |  |
| 20 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 21 | `PlacanoSIT` | `float` | Yes | No | No | `` |  |
| 22 | `Prodajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 23 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 24 | `RecNo` | `int` | No | Yes | No | `` |  |
| 25 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 26 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 27 | `Sklic` | `nvarchar(30)` | Yes | No | No | `` |  |
| 28 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 29 | `StevilkaObracunaDavka` | `smallint` | Yes | No | No | `` |  |
| 30 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 31 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 32 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 33 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 34 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 35 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 36 | `Vneseno` | `float` | Yes | No | No | `` |  |
| 37 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 38 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
