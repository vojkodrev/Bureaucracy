# `dbo`.`PartnerLastnosti`

_No table description is defined in MSSQL._

- Rows: 23
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Kategorija` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `Opcija` | `nvarchar(10)` | Yes | No | No | `` |  |
| 3 | `OpisPolja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `Sifra` | `nvarchar(10)` | Yes | No | No | `` |  |
| 6 | `Vrednost` | `nvarchar(100)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | No | NONCLUSTERED | 1 | `Sifra` | No |

## Check constraints

_None._
