# `dbo`.`Racuni`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `DnevniObracun` | `smallint` | Yes | No | No | `` |  |
| 4 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 5 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 6 | `MaticnaStevilka` | `nvarchar(6)` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 9 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 10 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 11 | `Znesek` | `float` | Yes | No | No | `` |  |

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
