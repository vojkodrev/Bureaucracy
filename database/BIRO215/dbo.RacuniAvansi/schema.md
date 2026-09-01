# `dbo`.`RacuniAvansi`

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
| 8 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 9 | `GK` | `smallint` | Yes | No | No | `` |  |
| 10 | `GK1` | `smallint` | Yes | No | No | `` |  |
| 11 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 12 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 13 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 14 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 15 | `KoncniTecajValute` | `float` | Yes | No | No | `` |  |
| 16 | `Kontakt` | `smallint` | Yes | No | No | `` |  |
| 17 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 18 | `KrajIzdaje` | `nvarchar(30)` | Yes | No | No | `` |  |
| 19 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 20 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 21 | `NacinPlacila` | `smallint` | Yes | No | No | `` |  |
| 22 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 23 | `Narocilnica` | `ntext` | Yes | No | No | `` |  |
| 24 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 25 | `ObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 26 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 27 | `OpisPlacila` | `nvarchar(20)` | Yes | No | No | `` |  |
| 28 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 29 | `PlacanoSIT` | `float` | Yes | No | No | `` |  |
| 30 | `Predloga` | `nvarchar(30)` | Yes | No | No | `` |  |
| 31 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 32 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 33 | `RecNo` | `int` | No | Yes | No | `` |  |
| 34 | `SifraKontakta` | `int` | Yes | No | No | `` |  |
| 35 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 36 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 37 | `Sklic` | `nvarchar(30)` | Yes | No | No | `` |  |
| 38 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 39 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 40 | `StevilkaDobavnice` | `nvarchar(6)` | Yes | No | No | `` |  |
| 41 | `StevilkaObracunaDavka` | `smallint` | Yes | No | No | `` |  |
| 42 | `StevilkaObracunaDavkaVMinus` | `smallint` | Yes | No | No | `` |  |
| 43 | `StevilkaPredracuna` | `nvarchar(6)` | Yes | No | No | `` |  |
| 44 | `StevilkaZaprtegaRacuna` | `nvarchar(10)` | Yes | No | No | `` |  |
| 45 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 46 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 47 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 48 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 49 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 50 | `Vneseno` | `float` | Yes | No | No | `` |  |
| 51 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 52 | `Znesek` | `float` | Yes | No | No | `` |  |

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
