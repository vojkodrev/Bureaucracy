# `dbo`.`ObracunObrestiAll`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `Grid` | `ntext` | Yes | No | No | `` |  |
| 5 | `ImeDatoteke` | `nvarchar(20)` | Yes | No | No | `` |  |
| 6 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 7 | `MaxRow` | `int` | Yes | No | No | `` |  |
| 8 | `NacinObracuna` | `smallint` | Yes | No | No | `` |  |
| 9 | `NaDan` | `datetime` | Yes | No | No | `` |  |
| 10 | `Obracunal` | `nvarchar(3)` | Yes | No | No | `` |  |
| 11 | `ObrestiMalir` | `float` | Yes | No | No | `` |  |
| 12 | `ObrestiVelikiR` | `float` | Yes | No | No | `` |  |
| 13 | `OpisStevilke` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `Partner` | `nvarchar(52)` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 17 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 18 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 19 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 20 | `Vneseno` | `float` | Yes | No | No | `` |  |

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
