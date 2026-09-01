# `dbo`.`KoeficientiRevalorizacije`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `k1` | `float` | Yes | No | No | `` |  |
| 3 | `k10` | `float` | Yes | No | No | `` |  |
| 4 | `k11` | `float` | Yes | No | No | `` |  |
| 5 | `k12` | `float` | Yes | No | No | `` |  |
| 6 | `k2` | `float` | Yes | No | No | `` |  |
| 7 | `k3` | `float` | Yes | No | No | `` |  |
| 8 | `k4` | `float` | Yes | No | No | `` |  |
| 9 | `k5` | `float` | Yes | No | No | `` |  |
| 10 | `k6` | `float` | Yes | No | No | `` |  |
| 11 | `k7` | `float` | Yes | No | No | `` |  |
| 12 | `k8` | `float` | Yes | No | No | `` |  |
| 13 | `k9` | `float` | Yes | No | No | `` |  |
| 14 | `Mesec` | `smallint` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Mesec` | No | NONCLUSTERED | 1 | `Mesec` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
