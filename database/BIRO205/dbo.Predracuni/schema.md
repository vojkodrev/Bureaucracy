# `dbo`.`Predracuni`

_No table description is defined in MSSQL._

- Rows: 24
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumAvansnegaRacuna` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumDobavnice` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumDUR` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumNarocila` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumRacuna` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 8 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 9 | `DatumZR` | `datetime` | Yes | No | No | `` |  |
| 10 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 11 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 12 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 13 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 14 | `IzvrsenoZAvansnimRacunomSIT` | `float` | Yes | No | No | `` |  |
| 15 | `IzvrsenoZDobavnicoSIT` | `float` | Yes | No | No | `` |  |
| 16 | `IzvrsenoZNarocilomSIT` | `float` | Yes | No | No | `` |  |
| 17 | `IzvrsenoZRacunomSIT` | `float` | Yes | No | No | `` |  |
| 18 | `IzvrsenoZZRSIT` | `float` | Yes | No | No | `` |  |
| 19 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 20 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 21 | `KrajIzdaje` | `nvarchar(30)` | Yes | No | No | `` |  |
| 22 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 23 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 24 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 25 | `Narocilnica` | `ntext` | Yes | No | No | `` |  |
| 26 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 27 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 28 | `OpisPlacila` | `nvarchar(20)` | Yes | No | No | `` |  |
| 29 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 30 | `Predloga` | `nvarchar(30)` | Yes | No | No | `` |  |
| 31 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 32 | `Prodajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 33 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 34 | `RecNo` | `int` | No | Yes | No | `` |  |
| 35 | `SifraKontakta` | `int` | Yes | No | No | `` |  |
| 36 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 37 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 38 | `Sklic` | `nvarchar(30)` | Yes | No | No | `` |  |
| 39 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 40 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 41 | `StevilkaAvansnegaRacuna` | `nvarchar(10)` | Yes | No | No | `` |  |
| 42 | `StevilkaDobavnice` | `nvarchar(6)` | Yes | No | No | `` |  |
| 43 | `StevilkaNarocila` | `nvarchar(10)` | Yes | No | No | `` |  |
| 44 | `StevilkaPredracuna` | `nvarchar(6)` | Yes | No | No | `` |  |
| 45 | `StevilkaRacuna` | `nvarchar(10)` | Yes | No | No | `` |  |
| 46 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 47 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 48 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 49 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 50 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 51 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 52 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 53 | `VrstaPredracuna` | `smallint` | Yes | No | No | `` |  |
| 54 | `Znesek` | `float` | Yes | No | No | `` |  |

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
