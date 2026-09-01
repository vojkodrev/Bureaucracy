# `dbo`.`RacuniSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 3 | `DavekOdRazlike` | `smallint` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 6 | `Komentar` | `nvarchar(255)` | Yes | No | No | `` |  |
| 7 | `NabavnaCena` | `float` | Yes | No | No | `` |  |
| 8 | `Rabat` | `decimal(12,6)` | Yes | No | No | `` |  |
| 9 | `RecNo` | `int` | No | Yes | No | `` |  |
| 10 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 11 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `Znesek` | `float` | Yes | No | No | `` |  |
| 13 | `ZnesekBrezDavka` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `Datum` | No | NONCLUSTERED | 2 | `Artikel` | No |
| `Nabava` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Nabava` | No | NONCLUSTERED | 2 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `SifraArtikla` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 2 | `Artikel` | No |

## Check constraints

_None._
