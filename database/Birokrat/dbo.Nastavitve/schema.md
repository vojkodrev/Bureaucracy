# `dbo`.`Nastavitve`

_No table description is defined in MSSQL._

- Rows: 2378
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `ImeNastavitve` | `nvarchar(255)` | Yes | No | No | `` |  |
| 3 | `Sekcija` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `Vrednost` | `nvarchar(255)` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Nastavitve` | No | NONCLUSTERED | 1 | `Sekcija` | No |
| `Nastavitve` | No | NONCLUSTERED | 2 | `ImeNastavitve` | No |
| `Recno` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
