# `dbo`.`DobavniceIzdajaOtvoritve`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumPotrditve` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 6 | `Dobavnica` | `smallint` | Yes | No | No | `` |  |
| 7 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 8 | `Drzava` | `nvarchar(10)` | Yes | No | No | `` |  |
| 9 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 10 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 11 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 12 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 13 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 14 | `KrajIzdaje` | `nvarchar(30)` | Yes | No | No | `` |  |
| 15 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 16 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 17 | `Narocilnica` | `ntext` | Yes | No | No | `` |  |
| 18 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 19 | `ObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 20 | `OpisDostave` | `nvarchar(20)` | Yes | No | No | `` |  |
| 21 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 22 | `PlacanoSIT` | `float` | Yes | No | No | `` |  |
| 23 | `Prodajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 24 | `RabatnaSkupina` | `nvarchar(1)` | Yes | No | No | `` |  |
| 25 | `RacunIzstavil` | `nvarchar(4)` | Yes | No | No | `` |  |
| 26 | `RazlikaPriFakturiranju` | `float` | Yes | No | No | `` |  |
| 27 | `RecNo` | `int` | No | Yes | No | `` |  |
| 28 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 29 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 30 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 31 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 32 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 33 | `StevilkaPredracuna` | `nvarchar(6)` | Yes | No | No | `` |  |
| 34 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 35 | `SuperRabat` | `float` | Yes | No | No | `` |  |
| 36 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 37 | `Ura` | `nvarchar(5)` | Yes | No | No | `` |  |
| 38 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 39 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 40 | `Vneseno` | `float` | Yes | No | No | `` |  |
| 41 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 42 | `VrstaDobavnice` | `smallint` | Yes | No | No | `` |  |
| 43 | `Znesek` | `float` | Yes | No | No | `` |  |
| 44 | `ZnesekPlacila` | `float` | Yes | No | No | `` |  |

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
