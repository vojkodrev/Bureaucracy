# `dbo`.`Povratnica`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CenaProdaja` | `float` | Yes | No | No | `` |  |
| 2 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `DavekProdaja` | `float` | Yes | No | No | `` |  |
| 5 | `GK` | `smallint` | Yes | No | No | `` |  |
| 6 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 7 | `Obrazlozitev` | `ntext` | Yes | No | No | `` |  |
| 8 | `PE` | `nvarchar(5)` | Yes | No | No | `` |  |
| 9 | `Prevzemnik` | `nvarchar(60)` | Yes | No | No | `` |  |
| 10 | `Prevzemzazavracilo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `Skladisce` | `smallint` | Yes | No | No | `` |  |
| 13 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 14 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 15 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 16 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 17 | `VrstaDobave` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
