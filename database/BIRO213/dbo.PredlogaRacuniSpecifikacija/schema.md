# `dbo`.`PredlogaRacuniSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `DavekOdRazlike` | `smallint` | Yes | No | No | `` |  |
| 3 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 4 | `Komentar` | `nvarchar(255)` | Yes | No | No | `` |  |
| 5 | `Rabat` | `decimal(12,6)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 8 | `Vrsta` | `smallint` | Yes | No | No | `` |  |
| 9 | `Zaporedje` | `smallint` | Yes | No | No | `` |  |
| 10 | `Znesek` | `float` | Yes | No | No | `` |  |
| 11 | `ZnesekBrezDavka` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `SifraArtikla` | No | NONCLUSTERED | 1 | `Artikel` | No |

## Check constraints

_None._
