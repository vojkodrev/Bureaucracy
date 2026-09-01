# `dbo`.`BILANCA`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `BREME1` | `float` | Yes | No | No | `` |  |
| 2 | `BREME2` | `float` | Yes | No | No | `` |  |
| 3 | `BREMESKUPAJ` | `float` | Yes | No | No | `` |  |
| 4 | `DOBRO1` | `float` | Yes | No | No | `` |  |
| 5 | `DOBRO2` | `float` | Yes | No | No | `` |  |
| 6 | `DOBROSKUPAJ` | `float` | Yes | No | No | `` |  |
| 7 | `KONTO` | `nvarchar(10)` | Yes | No | No | `` |  |
| 8 | `NAZIV` | `nvarchar(100)` | Yes | No | No | `` |  |
| 9 | `RecNo` | `int` | No | Yes | No | `` |  |
| 10 | `SALDOBREME` | `float` | Yes | No | No | `` |  |
| 11 | `SALDODOBRO` | `float` | Yes | No | No | `` |  |
| 12 | `TEMPKONTO` | `nvarchar(10)` | Yes | No | No | `` |  |
| 13 | `VrstaDokumenta` | `nvarchar(10)` | Yes | No | No | `` |  |

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
