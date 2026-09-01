# `dbo`.`IOP`

_No table description is defined in MSSQL._

- Rows: 58
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumIzvrsbe` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumOdgovora` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DodatnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 6 | `DrzavaPartnerja` | `nvarchar(5)` | Yes | No | No | `` |  |
| 7 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 8 | `InterniKomentar` | `ntext` | Yes | No | No | `` |  |
| 9 | `IzvrsbaDa` | `smallint` | Yes | No | No | `` |  |
| 10 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 11 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 12 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 13 | `NaDan` | `datetime` | Yes | No | No | `` |  |
| 14 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 15 | `Odgovor` | `ntext` | Yes | No | No | `` |  |
| 16 | `RecNo` | `int` | No | Yes | No | `` |  |
| 17 | `SeStrinja` | `smallint` | Yes | No | No | `` |  |
| 18 | `SifraKontakta` | `int` | Yes | No | No | `` |  |
| 19 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 20 | `SpremniText` | `ntext` | Yes | No | No | `` |  |
| 21 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 22 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 23 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 24 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 25 | `Znesek` | `float` | Yes | No | No | `` |  |

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
