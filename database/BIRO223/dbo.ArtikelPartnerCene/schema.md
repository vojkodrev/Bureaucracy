# `dbo`.`ArtikelPartnerCene`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `CenaZDavkom` | `float` | Yes | No | No | `` |  |
| 3 | `FiksniRabat` | `float` | Yes | No | No | `` |  |
| 4 | `Kolicina1` | `float` | Yes | No | No | `` |  |
| 5 | `Kolicina2` | `float` | Yes | No | No | `` |  |
| 6 | `Kolicina3` | `float` | Yes | No | No | `` |  |
| 7 | `Kolicina4` | `float` | Yes | No | No | `` |  |
| 8 | `NeDovoliPopusta` | `smallint` | Yes | No | No | `` |  |
| 9 | `Popust1` | `float` | Yes | No | No | `` |  |
| 10 | `Popust2` | `int` | Yes | No | No | `` |  |
| 11 | `Popust3` | `float` | Yes | No | No | `` |  |
| 12 | `Popust4` | `float` | Yes | No | No | `` |  |
| 13 | `Rabat` | `float` | Yes | No | No | `` |  |
| 14 | `RecNo` | `int` | No | Yes | No | `` |  |
| 15 | `SifraPartnerja` | `nvarchar(25)` | Yes | No | No | `` |  |
| 16 | `Velja` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Arikel` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `ArtikelEnota` | Yes | NONCLUSTERED | 1 | `Artikel` | No |
| `ArtikelEnota` | Yes | NONCLUSTERED | 2 | `SifraPartnerja` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
