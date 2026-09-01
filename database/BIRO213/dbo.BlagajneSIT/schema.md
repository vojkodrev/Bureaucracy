# `dbo`.`BlagajneSIT`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Naziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `OtvoritvenoStanje` | `float` | Yes | No | No | `` |  |
| 4 | `Oznaka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 5 | `OznakaMaloprodaje` | `nvarchar(2)` | Yes | No | No | `` |  |
| 6 | `OznakaZaGK` | `nvarchar(2)` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Oznaka` | Yes | NONCLUSTERED | 1 | `Oznaka` | No |

## Check constraints

_None._
