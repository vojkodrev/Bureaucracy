# `dbo`.`PE`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `IME` | `nvarchar(100)` | Yes | No | No | `` |  |
| 3 | `NeUporabljajReceptor` | `smallint` | Yes | No | No | `` |  |
| 4 | `Nivo` | `smallint` | Yes | No | No | `` |  |
| 5 | `Opis` | `nvarchar(100)` | Yes | No | No | `` |  |
| 6 | `OZNAKA` | `nvarchar(20)` | Yes | No | No | `` |  |
| 7 | `PodOznaka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 8 | `RecNo` | `int` | No | Yes | No | `` |  |
| 9 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `PE` | No | NONCLUSTERED | 1 | `OZNAKA` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
