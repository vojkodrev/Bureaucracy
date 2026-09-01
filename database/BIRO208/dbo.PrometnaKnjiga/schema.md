# `dbo`.`PrometnaKnjiga`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 3 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 4 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 5 | `NabavnaCena` | `float` | Yes | No | No | `` |  |
| 6 | `Popust` | `float` | Yes | No | No | `` |  |
| 7 | `ProdajnaCenaSPD` | `float` | Yes | No | No | `` |  |
| 8 | `ProdajniArtikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 9 | `RecNo` | `int` | No | Yes | No | `` |  |
| 10 | `SifraDavka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 11 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 13 | `VrstaDogodka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `VrstaPrometa` | `nvarchar(1)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Artikel` | No | NONCLUSTERED | 2 | `Datum` | No |
| `ARtikelInVrsta` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `ARtikelInVrsta` | No | NONCLUSTERED | 2 | `VrstaDogodka` | No |
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `PrometnaKnjiga1` | No | NONCLUSTERED | 1 | `Datum` | No |
| `PrometnaKnjiga1` | No | NONCLUSTERED | 2 | `NabavnaCena` | No |
| `PrometnaKnjiga2` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `PrometnaKnjiga2` | No | NONCLUSTERED | 2 | `Datum` | No |
| `PrometnaKnjiga2` | No | NONCLUSTERED | 3 | `Kolicina` | No |
| `PrometnaKnjiga3` | No | NONCLUSTERED | 1 | `Datum` | No |
| `PrometnaKnjiga3` | No | NONCLUSTERED | 2 | `Artikel` | No |
| `PrometnaKnjiga3` | No | NONCLUSTERED | 3 | `NabavnaCena` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Vrsta` | No | NONCLUSTERED | 1 | `VrstaDogodka` | No |
| `Vrsta` | No | NONCLUSTERED | 2 | `Stevilka` | No |
| `VrstaStevilkaArtikel` | No | NONCLUSTERED | 1 | `VrstaDogodka` | No |
| `VrstaStevilkaArtikel` | No | NONCLUSTERED | 2 | `Stevilka` | No |
| `VrstaStevilkaArtikel` | No | NONCLUSTERED | 3 | `Artikel` | No |

## Check constraints

_None._
