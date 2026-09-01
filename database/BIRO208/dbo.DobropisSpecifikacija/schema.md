# `dbo`.`DobropisSpecifikacija`

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
| 5 | `Enota` | `nvarchar(10)` | Yes | No | No | `` |  |
| 6 | `GroupArt` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 8 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 9 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `NabavnaCena` | `float` | Yes | No | No | `` |  |
| 11 | `NeUpostevajZaDDV` | `smallint` | Yes | No | No | `` |  |
| 12 | `Opis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `OznakaLeta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 15 | `Rabat` | `decimal(12,6)` | Yes | No | No | `` |  |
| 16 | `Racun` | `nvarchar(10)` | Yes | No | No | `` |  |
| 17 | `RacunIzOtvoritve` | `smallint` | Yes | No | No | `` |  |
| 18 | `RecNo` | `int` | No | Yes | No | `` |  |
| 19 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 20 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 22 | `Zaporedje` | `smallint` | Yes | No | No | `` |  |
| 23 | `Znesek` | `float` | Yes | No | No | `` |  |
| 24 | `ZnesekBrezDavka` | `float` | Yes | No | No | `` |  |

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
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 2 | `Artikel` | No |

## Check constraints

_None._
