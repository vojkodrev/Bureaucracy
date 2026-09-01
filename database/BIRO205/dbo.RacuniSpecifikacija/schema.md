# `dbo`.`RacuniSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 1896
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 3 | `DavekOdRazlike` | `smallint` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `DN` | `nvarchar(8)` | Yes | No | No | `` |  |
| 6 | `DNGotovi` | `nvarchar(8)` | Yes | No | No | `` |  |
| 7 | `Dobavnica` | `nvarchar(6)` | Yes | No | No | `` |  |
| 8 | `DobavnicaIzOtvoritve` | `tinyint` | Yes | No | No | `` |  |
| 9 | `GroupArt` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 11 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 12 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 13 | `NabavnaCena` | `float` | Yes | No | No | `` |  |
| 14 | `Narocilo` | `nvarchar(6)` | Yes | No | No | `` |  |
| 15 | `NeUpostevajZaDDV` | `smallint` | Yes | No | No | `` |  |
| 16 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 17 | `POSDobavnica` | `nvarchar(10)` | Yes | No | No | `` |  |
| 18 | `Rabat` | `decimal(12,6)` | Yes | No | No | `` |  |
| 19 | `RecNo` | `int` | No | Yes | No | `` |  |
| 20 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 21 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 22 | `Ura` | `nvarchar(10)` | Yes | No | No | `` |  |
| 23 | `Zaporedje` | `smallint` | Yes | No | No | `` |  |
| 24 | `Znesek` | `float` | Yes | No | No | `` |  |
| 25 | `ZnesekBrezDavka` | `float` | Yes | No | No | `` |  |

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
