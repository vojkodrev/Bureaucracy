# `dbo`.`Narocilnice`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumDostave` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `DogovorjenaCena` | `float` | Yes | No | No | `` |  |
| 5 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 6 | `Izjava` | `smallint` | Yes | No | No | `` |  |
| 7 | `MestoDostave` | `nvarchar(100)` | Yes | No | No | `` |  |
| 8 | `NacinPlacila` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `Opombe` | `ntext` | Yes | No | No | `` |  |
| 10 | `Partner` | `nvarchar(6)` | Yes | No | No | `` |  |
| 11 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 12 | `RecNo` | `int` | No | Yes | No | `` |  |
| 13 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 14 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 15 | `TextIzjave1` | `ntext` | Yes | No | No | `` |  |
| 16 | `TextIzjave2` | `ntext` | Yes | No | No | `` |  |
| 17 | `TextIzjave3` | `ntext` | Yes | No | No | `` |  |
| 18 | `TextIzjave4` | `ntext` | Yes | No | No | `` |  |
| 19 | `TextIzjave5` | `ntext` | Yes | No | No | `` |  |
| 20 | `TextIzjave6` | `ntext` | Yes | No | No | `` |  |
| 21 | `TextIzjave7` | `ntext` | Yes | No | No | `` |  |
| 22 | `UvodIzjave` | `ntext` | Yes | No | No | `` |  |
| 23 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
