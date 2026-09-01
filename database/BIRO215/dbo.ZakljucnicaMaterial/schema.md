# `dbo`.`ZakljucnicaMaterial`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `ArtikelNaRacunu` | `nvarchar(25)` | Yes | No | No | `` |  |
| 3 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `Enota` | `nvarchar(10)` | Yes | No | No | `` |  |
| 6 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 7 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 8 | `NabavnaCena` | `float` | Yes | No | No | `` |  |
| 9 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `ProdajnaCenaObNabavi` | `float` | Yes | No | No | `` |  |
| 11 | `ProdajniDavekObNabavi` | `float` | Yes | No | No | `` |  |
| 12 | `ProdajniSifraDavkaObNabavi` | `nvarchar(5)` | Yes | No | No | `` |  |
| 13 | `RecNo` | `int` | No | Yes | No | `` |  |
| 14 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 15 | `Zaporedje` | `smallint` | Yes | No | No | `` |  |
| 16 | `Znesek` | `float` | Yes | No | No | `` |  |

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

## Check constraints

_None._
