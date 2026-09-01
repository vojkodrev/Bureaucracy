# `dbo`.`Kartice`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumCeka` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `davek` | `float` | Yes | No | No | `` |  |
| 5 | `OBC` | `nvarchar(30)` | Yes | No | No | `` |  |
| 6 | `OpisDavka` | `nvarchar(25)` | Yes | No | No | `` |  |
| 7 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 8 | `Prejemek` | `smallint` | Yes | No | No | `` |  |
| 9 | `Provizija` | `float` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 12 | `StevilkaCeka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 13 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 14 | `Znesek` | `float` | Yes | No | No | `` |  |
| 15 | `ZR` | `nvarchar(30)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
