# `dbo`.`Konsignacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumDo` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumOd` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `Sheet1` | `ntext` | Yes | No | No | `` |  |
| 8 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 9 | `Skladisce` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 11 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 12 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 13 | `VrstaObracuna` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
