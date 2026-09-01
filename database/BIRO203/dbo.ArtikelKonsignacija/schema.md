# `dbo`.`ArtikelKonsignacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `Partner` | `nvarchar(10)` | Yes | No | No | `` |  |
| 4 | `Rabat` | `smallint` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | Yes | NONCLUSTERED | 1 | `Artikel` | No |
| `ArtikelPartner` | Yes | NONCLUSTERED | 1 | `Partner` | No |
| `ArtikelPartner` | Yes | NONCLUSTERED | 2 | `Artikel` | No |
| `Recno` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
