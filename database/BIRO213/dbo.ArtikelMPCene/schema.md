# `dbo`.`ArtikelMPCene`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Cena1` | `float` | Yes | No | No | `` |  |
| 3 | `Cena2` | `float` | Yes | No | No | `` |  |
| 4 | `Cena3` | `float` | Yes | No | No | `` |  |
| 5 | `CenaZDavkom` | `float` | Yes | No | No | `` |  |
| 6 | `IzpisNarocila` | `smallint` | Yes | No | No | `` |  |
| 7 | `IzpisNarocila2` | `smallint` | Yes | No | No | `` |  |
| 8 | `NeDovoliPopusta` | `smallint` | Yes | No | No | `` |  |
| 9 | `OznakaMP` | `nvarchar(5)` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `Velja` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Arikel` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `ArtikelEnota` | Yes | NONCLUSTERED | 1 | `Artikel` | No |
| `ArtikelEnota` | Yes | NONCLUSTERED | 2 | `OznakaMP` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
