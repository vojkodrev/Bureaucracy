# `dbo`.`ObracunObresti`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumDokumenta` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumKonca` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumPricetka` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 6 | `Glavnica` | `float` | Yes | No | No | `` |  |
| 7 | `Grid` | `ntext` | Yes | No | No | `` |  |
| 8 | `ImeDatoteke` | `nvarchar(20)` | Yes | No | No | `` |  |
| 9 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 10 | `MaxRow` | `int` | Yes | No | No | `` |  |
| 11 | `NacinObracuna` | `smallint` | Yes | No | No | `` |  |
| 12 | `Obracunal` | `nvarchar(3)` | Yes | No | No | `` |  |
| 13 | `ObrestiMalir` | `float` | Yes | No | No | `` |  |
| 14 | `ObrestiVelikiR` | `float` | Yes | No | No | `` |  |
| 15 | `OpisDokumenta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 16 | `OpisStevilke` | `nvarchar(50)` | Yes | No | No | `` |  |
| 17 | `Partner` | `nvarchar(52)` | Yes | No | No | `` |  |
| 18 | `RecNo` | `int` | No | Yes | No | `` |  |
| 19 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 20 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 21 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 22 | `ValutaDokumenta` | `datetime` | Yes | No | No | `` |  |
| 23 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

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
