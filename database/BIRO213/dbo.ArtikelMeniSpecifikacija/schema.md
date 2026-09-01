# `dbo`.`ArtikelMeniSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `DatumVeljavnosti` | `datetime` | Yes | No | No | `` |  |
| 3 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 4 | `Meni` | `nvarchar(10)` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Meni` | Yes | NONCLUSTERED | 1 | `Meni` | No |
| `Meni` | Yes | NONCLUSTERED | 2 | `Artikel` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
