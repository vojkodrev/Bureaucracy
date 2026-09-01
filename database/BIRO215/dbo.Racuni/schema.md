# `dbo`.`Racuni`

_No table description is defined in MSSQL._

- Rows: 1111
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
| 8 | `DnevniObracun` | `smallint` | Yes | No | No | `` |  |
| 9 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 10 | `GK` | `smallint` | Yes | No | No | `` |  |
| 11 | `GK1` | `smallint` | Yes | No | No | `` |  |
| 12 | `GK2` | `smallint` | Yes | No | No | `` |  |
| 13 | `GK3` | `smallint` | Yes | No | No | `` |  |
| 14 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 15 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 16 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 17 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 18 | `KoeficientZaDDV` | `float` | Yes | No | No | `` |  |
| 19 | `KoncniTecajValute` | `float` | Yes | No | No | `` |  |
| 20 | `Kontakt` | `smallint` | Yes | No | No | `` |  |
| 21 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 22 | `KrajIzdaje` | `nvarchar(30)` | Yes | No | No | `` |  |
| 23 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 24 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 25 | `NacinPlacila` | `nvarchar(3)` | Yes | No | No | `` |  |
| 26 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 27 | `Narocilnica` | `ntext` | Yes | No | No | `` |  |
| 28 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 29 | `ObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 30 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 31 | `OpisPlacila` | `nvarchar(20)` | Yes | No | No | `` |  |
| 32 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 33 | `PlacanoSIT` | `float` | Yes | No | No | `` |  |
| 34 | `PopustBrezPD` | `float` | Yes | No | No | `` |  |
| 35 | `PopustPD` | `float` | Yes | No | No | `` |  |
| 36 | `Predloga` | `nvarchar(30)` | Yes | No | No | `` |  |
| 37 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 38 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 39 | `Rabat` | `float` | Yes | No | No | `` |  |
| 40 | `RabatOD` | `smallint` | Yes | No | No | `` |  |
| 41 | `RabatSIT` | `float` | Yes | No | No | `` |  |
| 42 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 43 | `RecNo` | `int` | No | Yes | No | `` |  |
| 44 | `SifraKontakta` | `int` | Yes | No | No | `` |  |
| 45 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 46 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 47 | `Sklic` | `nvarchar(30)` | Yes | No | No | `` |  |
| 48 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 49 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 50 | `StevilkaDobavnice` | `nvarchar(10)` | Yes | No | No | `` |  |
| 51 | `StevilkaObracunaDavka` | `smallint` | Yes | No | No | `` |  |
| 52 | `StevilkaPOS` | `nvarchar(10)` | Yes | No | No | `` |  |
| 53 | `StevilkaPredracuna` | `nvarchar(10)` | Yes | No | No | `` |  |
| 54 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 55 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 56 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 57 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 58 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 59 | `Vneseno` | `float` | Yes | No | No | `` |  |
| 60 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 61 | `VrstaRacuna` | `smallint` | Yes | No | No | `` |  |
| 62 | `Znesek` | `float` | Yes | No | No | `` |  |
| 63 | `ZnesekBlaga` | `float` | Yes | No | No | `` |  |
| 64 | `ZnesekBlagaPD` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Dobavnica` | No | NONCLUSTERED | 1 | `StevilkaDobavnice` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
