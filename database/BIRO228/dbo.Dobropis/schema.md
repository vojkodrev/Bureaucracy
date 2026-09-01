# `dbo`.`Dobropis`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumDUR` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumPotrdila` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumZaObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 8 | `DodatnaStevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 9 | `GK` | `smallint` | Yes | No | No | `` |  |
| 10 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 11 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 12 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 13 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 14 | `Kontakt` | `smallint` | Yes | No | No | `` |  |
| 15 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 16 | `KrajIzdaje` | `nvarchar(30)` | Yes | No | No | `` |  |
| 17 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 18 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 19 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 20 | `Narocilnica` | `ntext` | Yes | No | No | `` |  |
| 21 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 22 | `ObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 23 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 24 | `OpisPlacila` | `nvarchar(20)` | Yes | No | No | `` |  |
| 25 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 26 | `PopustBrezPD` | `float` | Yes | No | No | `` |  |
| 27 | `PopustPD` | `float` | Yes | No | No | `` |  |
| 28 | `Predloga` | `nvarchar(30)` | Yes | No | No | `` |  |
| 29 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 30 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 31 | `RecNo` | `int` | No | Yes | No | `` |  |
| 32 | `SifraKontakta` | `int` | Yes | No | No | `` |  |
| 33 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 34 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 35 | `Sklic` | `nvarchar(30)` | Yes | No | No | `` |  |
| 36 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 37 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 38 | `StevilkaObracunaDavka` | `smallint` | Yes | No | No | `` |  |
| 39 | `StevilkaPredracuna` | `nvarchar(25)` | Yes | No | No | `` |  |
| 40 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 41 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 42 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 43 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 44 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 45 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 46 | `VrstaDobropisa` | `smallint` | Yes | No | No | `` |  |
| 47 | `Znesek` | `float` | Yes | No | No | `` |  |
| 48 | `ZnesekBlaga` | `float` | Yes | No | No | `` |  |
| 49 | `ZnesekBlagaPD` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
