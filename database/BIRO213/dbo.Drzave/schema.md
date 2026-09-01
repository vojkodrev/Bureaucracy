# `dbo`.`Drzave`

_No table description is defined in MSSQL._

- Rows: 3
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `ClanEU` | `smallint` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `Drzava` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `ImeDrzaveZaPosto` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `ImeValute` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Jezik` | `nvarchar(3)` | Yes | No | No | `` |  |
| 8 | `OznakaDrzave` | `nvarchar(3)` | Yes | No | No | `` |  |
| 9 | `OznakaZaStatistiko` | `nvarchar(5)` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `SifraBS` | `nvarchar(5)` | Yes | No | No | `` |  |
| 12 | `SifraDrzave` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `SifraISO` | `nvarchar(5)` | Yes | No | No | `` |  |
| 14 | `SifraValute` | `nvarchar(3)` | Yes | No | No | `` |  |
| 15 | `SifraZaIntrastat` | `nvarchar(5)` | Yes | No | No | `` |  |
| 16 | `SifraZaPolicijo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 17 | `SifraZaStatistiko` | `nvarchar(5)` | Yes | No | No | `` |  |
| 18 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 19 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Drzava` | Yes | NONCLUSTERED | 1 | `OznakaDrzave` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Valuta` | No | NONCLUSTERED | 1 | `Valuta` | No |

## Check constraints

_None._
