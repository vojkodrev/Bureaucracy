# `dbo`.`Poste`

_No table description is defined in MSSQL._

- Rows: 489
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `DRZAVA` | `nvarchar(3)` | Yes | No | No | `` |  |
| 3 | `NAZIV` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `STEVILKA` | `nvarchar(10)` | Yes | No | No | `` |  |
| 6 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `DrzavaInNaziv` | No | NONCLUSTERED | 1 | `DRZAVA` | No |
| `DrzavaInNaziv` | No | NONCLUSTERED | 2 | `NAZIV` | No |
| `DrzavaInPosta` | Yes | NONCLUSTERED | 1 | `DRZAVA` | No |
| `DrzavaInPosta` | Yes | NONCLUSTERED | 2 | `STEVILKA` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
