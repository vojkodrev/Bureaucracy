# `dbo`.`ArtikelCene`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `CenaBrezDavka` | `float` | Yes | No | No | `` |  |
| 3 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `Dokument` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `RocnoVneseno` | `smallint` | Yes | No | No | `` |  |
| 8 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 9 | `Skladisce` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 11 | `StopnjaDavka` | `float` | Yes | No | No | `` |  |
| 12 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | Yes | NONCLUSTERED | 1 | `Artikel` | No |
| `Artikel` | Yes | NONCLUSTERED | 2 | `Datum` | No |
| `Artikel` | Yes | NONCLUSTERED | 3 | `Skladisce` | No |

## Check constraints

_None._
