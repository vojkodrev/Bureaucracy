# `dbo`.`PrenosMedSkladisci`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CenaProdaja` | `float` | Yes | No | No | `` |  |
| 2 | `Cilj` | `nvarchar(80)` | Yes | No | No | `` |  |
| 3 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DavekProdaja` | `float` | Yes | No | No | `` |  |
| 6 | `GK` | `smallint` | Yes | No | No | `` |  |
| 7 | `Izvor` | `nvarchar(80)` | Yes | No | No | `` |  |
| 8 | `Komentar` | `nvarchar(255)` | Yes | No | No | `` |  |
| 9 | `NaPodlagiOtvoritve` | `smallint` | Yes | No | No | `` |  |
| 10 | `Operater` | `nvarchar(3)` | Yes | No | No | `` |  |
| 11 | `OriginalStevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `POSStevilka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 13 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `RecNo` | `int` | No | Yes | No | `` |  |
| 15 | `Stevilka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 16 | `UporabaCen` | `smallint` | Yes | No | No | `` |  |
| 17 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 18 | `VrstaPrenosa` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
