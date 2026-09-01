# `dbo`.`BankaZR`

_No table description is defined in MSSQL._

- Rows: 529
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Banka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `BankaNakazilaZBS` | `nvarchar(2)` | Yes | No | No | `` |  |
| 3 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DatumZBS` | `datetime` | Yes | No | No | `` |  |
| 6 | `DrugaObveznost` | `int` | Yes | No | No | `` |  |
| 7 | `GK` | `smallint` | Yes | No | No | `` |  |
| 8 | `GK1` | `smallint` | Yes | No | No | `` |  |
| 9 | `GK2` | `smallint` | Yes | No | No | `` |  |
| 10 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 11 | `IzPlacilaRacuna` | `smallint` | Yes | No | No | `` |  |
| 12 | `IzplaciloPN` | `smallint` | Yes | No | No | `` |  |
| 13 | `Izvor` | `smallint` | Yes | No | No | `` |  |
| 14 | `JeZR` | `smallint` | Yes | No | No | `` |  |
| 15 | `Kompenzacija` | `nvarchar(10)` | Yes | No | No | `` |  |
| 16 | `NacinPlacilaIndex` | `smallint` | Yes | No | No | `` |  |
| 17 | `NumStevilka` | `int` | Yes | No | No | `` |  |
| 18 | `OpisDokumenta` | `nvarchar(15)` | Yes | No | No | `` |  |
| 19 | `Opomba` | `ntext` | Yes | No | No | `` |  |
| 20 | `OriginalStevilka` | `nvarchar(4)` | Yes | No | No | `` |  |
| 21 | `OznakaLeta` | `nvarchar(2)` | Yes | No | No | `` |  |
| 22 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 23 | `ProtivrednostVBreme` | `float` | Yes | No | No | `` |  |
| 24 | `ProtivrednostVDobro` | `float` | Yes | No | No | `` |  |
| 25 | `RecNo` | `int` | No | Yes | No | `` |  |
| 26 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 27 | `SIT` | `smallint` | Yes | No | No | `` |  |
| 28 | `Sklic` | `nvarchar(13)` | Yes | No | No | `` |  |
| 29 | `Stevilka` | `nvarchar(8)` | Yes | No | No | `` |  |
| 30 | `StevilkaPredracuna` | `nvarchar(5)` | Yes | No | No | `` |  |
| 31 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 32 | `TKDIS` | `tinyint` | Yes | No | No | `` |  |
| 33 | `Valuta` | `nvarchar(5)` | Yes | No | No | `` |  |
| 34 | `VBreme` | `float` | Yes | No | No | `` |  |
| 35 | `VDobro` | `float` | Yes | No | No | `` |  |
| 36 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 37 | `VrstaDogodka` | `smallint` | Yes | No | No | `` |  |
| 38 | `ZnesekVValuti` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `AAA` | No | NONCLUSTERED | 1 | `Datum` | No |
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `NumStevilka` | No | NONCLUSTERED | 1 | `NumStevilka` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `VrstaDogodka` | No |
| `Stevilka` | No | NONCLUSTERED | 2 | `Stevilka` | No |
| `StevilkaDokumenta` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
