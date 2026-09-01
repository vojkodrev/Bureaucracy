# `dbo`.`Kompenzacije`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumIzvrsitve` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 5 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 6 | `KontaktPartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 7 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 8 | `NaslovPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 9 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 13 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 14 | `ZnesekPlacil` | `float` | Yes | No | No | `` |  |
| 15 | `ZnesekRacunov` | `float` | Yes | No | No | `` |  |

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
