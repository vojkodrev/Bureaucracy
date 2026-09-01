# `dbo`.`DobavniceIzdaja`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `BrezZneskov` | `smallint` | Yes | No | No | `` |  |
| 2 | `DatumDUR` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumPotrditve` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 7 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 8 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 9 | `Dobavnica` | `smallint` | Yes | No | No | `` |  |
| 10 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 11 | `Drzava` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 13 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 14 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 15 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 16 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 17 | `KrajIzdaje` | `nvarchar(30)` | Yes | No | No | `` |  |
| 18 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 19 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 20 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 21 | `Narocilnica` | `ntext` | Yes | No | No | `` |  |
| 22 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 23 | `ObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 24 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 25 | `OpisPlacila` | `nvarchar(20)` | Yes | No | No | `` |  |
| 26 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 27 | `PlacanoSIT` | `float` | Yes | No | No | `` |  |
| 28 | `Predloga` | `nvarchar(30)` | Yes | No | No | `` |  |
| 29 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 30 | `Prodajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 31 | `RabatnaSkupina` | `nvarchar(1)` | Yes | No | No | `` |  |
| 32 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 33 | `RazlikaPriFakturiranju` | `float` | Yes | No | No | `` |  |
| 34 | `RecNo` | `int` | No | Yes | No | `` |  |
| 35 | `RokDobave` | `datetime` | Yes | No | No | `` |  |
| 36 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 37 | `SifraKontakta` | `int` | Yes | No | No | `` |  |
| 38 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 39 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 40 | `Sklic` | `nvarchar(30)` | Yes | No | No | `` |  |
| 41 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 42 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 43 | `StevilkaPredracuna` | `nvarchar(6)` | Yes | No | No | `` |  |
| 44 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 45 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 46 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 47 | `Ura` | `nvarchar(5)` | Yes | No | No | `` |  |
| 48 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 49 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 50 | `Vneseno` | `float` | Yes | No | No | `` |  |
| 51 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 52 | `VrstaDobavnice` | `smallint` | Yes | No | No | `` |  |
| 53 | `Znesek` | `float` | Yes | No | No | `` |  |
| 54 | `ZnesekPlacila` | `float` | Yes | No | No | `` |  |

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
