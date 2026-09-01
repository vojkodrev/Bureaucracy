# `dbo`.`Narocilo`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumDUR` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumIzvrsitve` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumPotrditve` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 7 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 8 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 9 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 10 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 11 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 12 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 13 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 14 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 15 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 16 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 17 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 18 | `Narocilnica` | `ntext` | Yes | No | No | `` |  |
| 19 | `NarociloIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 20 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 21 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 22 | `OpisPlacila` | `nvarchar(20)` | Yes | No | No | `` |  |
| 23 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 24 | `PlacanoSIT` | `float` | Yes | No | No | `` |  |
| 25 | `Predloga` | `nvarchar(30)` | Yes | No | No | `` |  |
| 26 | `PredvideniRokDobave` | `datetime` | Yes | No | No | `` |  |
| 27 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 28 | `RabatnaSkupina` | `nvarchar(1)` | Yes | No | No | `` |  |
| 29 | `RacunIzstavil` | `nvarchar(10)` | Yes | No | No | `` |  |
| 30 | `RazlikaPriFakturiranju` | `float` | Yes | No | No | `` |  |
| 31 | `RecNo` | `int` | No | Yes | No | `` |  |
| 32 | `SifraKontakta` | `smallint` | Yes | No | No | `` |  |
| 33 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 34 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 35 | `Sklic` | `nvarchar(50)` | Yes | No | No | `` |  |
| 36 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 37 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 38 | `StevilkaPredracuna` | `nvarchar(6)` | Yes | No | No | `` |  |
| 39 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 40 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 41 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 42 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 43 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 44 | `Vneseno` | `float` | Yes | No | No | `` |  |
| 45 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 46 | `VrstaDobavnice` | `smallint` | Yes | No | No | `` |  |
| 47 | `Znesek` | `float` | Yes | No | No | `` |  |

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
