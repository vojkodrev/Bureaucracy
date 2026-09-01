# `dbo`.`PrenosSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Carina` | `float` | Yes | No | No | `` |  |
| 3 | `CarinskaStopnja` | `float` | Yes | No | No | `` |  |
| 4 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 5 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 6 | `DN` | `smallint` | Yes | No | No | `` |  |
| 7 | `GotoviIzdelek` | `smallint` | Yes | No | No | `` |  |
| 8 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 9 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `NormiraniStroski` | `float` | Yes | No | No | `` |  |
| 11 | `ProdajnaCenaObNabavi` | `float` | Yes | No | No | `` |  |
| 12 | `ProdajniDavekObNabavi` | `float` | Yes | No | No | `` |  |
| 13 | `ProdajniSifraDavkaObNabavi` | `nvarchar(5)` | Yes | No | No | `` |  |
| 14 | `RecNo` | `int` | No | Yes | No | `` |  |
| 15 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 16 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 17 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 18 | `VValuti` | `float` | Yes | No | No | `` |  |
| 19 | `Znesek` | `float` | Yes | No | No | `` |  |
| 20 | `ZnesekBrezDavka` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `ArtikelRecNo` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `ArtikelRecNo` | No | NONCLUSTERED | 2 | `RecNo` | No |
| `Nabava` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Nabava` | No | NONCLUSTERED | 2 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
