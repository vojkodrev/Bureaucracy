# `dbo`.`ODPE`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `OD` | `smallint` | Yes | No | No | `` |  |
| 2 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `ProcentPrispevkiIZ` | `float` | Yes | No | No | `` |  |
| 4 | `ProcentPrispevkiNa` | `float` | Yes | No | No | `` |  |
| 5 | `ProcentPrispevkovBonitete` | `float` | Yes | No | No | `` |  |
| 6 | `ProcentPrispevkovDelo` | `float` | Yes | No | No | `` |  |
| 7 | `ProcentPrispevkovVladaPrehrana` | `float` | Yes | No | No | `` |  |
| 8 | `ProcentPrispevkovVladaPrevoz` | `float` | Yes | No | No | `` |  |
| 9 | `RecNo` | `int` | No | Yes | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `OD` | No | NONCLUSTERED | 1 | `OD` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
