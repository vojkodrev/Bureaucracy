# `dbo`.`Sinhronizacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `Opis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `RecNo` | `int` | No | Yes | No | `` |  |
| 4 | `StevilkaPrenosa` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `StevilkaPrenosa` | Yes | NONCLUSTERED | 1 | `StevilkaPrenosa` | No |

## Check constraints

_None._
