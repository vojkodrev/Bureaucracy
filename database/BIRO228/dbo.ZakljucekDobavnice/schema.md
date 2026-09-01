# `dbo`.`ZakljucekDobavnice`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 2 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 3 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 4 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 5 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `SifraPartnerja` | `nvarchar(15)` | Yes | No | No | `` |  |
| 8 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 9 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 10 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 11 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 12 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
