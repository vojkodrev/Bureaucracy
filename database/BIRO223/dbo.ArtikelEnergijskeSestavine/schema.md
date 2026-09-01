# `dbo`.`ArtikelEnergijskeSestavine`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `AlternativnaME` | `nvarchar(10)` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `ME` | `nvarchar(10)` | Yes | No | No | `` |  |
| 4 | `Naziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `Pretvornik` | `float` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `Sifra` | `int` | Yes | No | No | `` |  |
| 8 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | Yes | NONCLUSTERED | 1 | `Sifra` | No |

## Check constraints

_None._
