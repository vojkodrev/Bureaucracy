# `dbo`.`OtvoritveSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 5 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 6 | `NCDobropis` | `float` | Yes | No | No | `` |  |
| 7 | `NCLastnaPoraba` | `float` | Yes | No | No | `` |  |
| 8 | `NCPrenosVMP` | `float` | Yes | No | No | `` |  |
| 9 | `NCProdaja` | `float` | Yes | No | No | `` |  |
| 10 | `NCProdajaMP` | `float` | Yes | No | No | `` |  |
| 11 | `NCProdajaMPDDV` | `float` | Yes | No | No | `` |  |
| 12 | `NCReprezentanca` | `float` | Yes | No | No | `` |  |
| 13 | `NCZakljucekDobavnic` | `float` | Yes | No | No | `` |  |
| 14 | `ProdajnaCenaObNabavi` | `float` | Yes | No | No | `` |  |
| 15 | `ProdajniDavekObNabavi` | `float` | Yes | No | No | `` |  |
| 16 | `ProdajniSifraDavkaObNabavi` | `nvarchar(5)` | Yes | No | No | `` |  |
| 17 | `RecNo` | `int` | No | Yes | No | `` |  |
| 18 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 19 | `Ura` | `nvarchar(5)` | Yes | No | No | `` |  |
| 20 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Nabava` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Nabava` | No | NONCLUSTERED | 2 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 2 | `Artikel` | No |

## Check constraints

_None._
