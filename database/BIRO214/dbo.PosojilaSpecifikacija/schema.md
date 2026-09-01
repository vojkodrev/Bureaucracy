# `dbo`.`PosojilaSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVracila` | `datetime` | Yes | No | No | `` |  |
| 2 | `NacinNakazila` | `smallint` | Yes | No | No | `` |  |
| 3 | `OznakaLeta` | `nvarchar(2)` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 6 | `ZaporednaStevilka` | `smallint` | Yes | No | No | `` |  |
| 7 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | No | NONCLUSTERED | 2 | `OznakaLeta` | No |

## Check constraints

_None._
