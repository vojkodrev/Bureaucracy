# `dbo`.`PartnerLastnostiSifrant`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 3 | `Naziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `NoUpdate` | `smallint` | Yes | No | No | `` |  |
| 5 | `OpisSkupine` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `Oznaka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `Sifra` | `nvarchar(10)` | Yes | No | No | `` |  |
| 9 | `Skupina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `Splosno` | `smallint` | Yes | No | No | `` |  |
| 11 | `Tip` | `nvarchar(50)` | Yes | No | No | `` |  |
| 12 | `Vnasalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `ZaporednaStevilka` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `PrimaryKey` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
