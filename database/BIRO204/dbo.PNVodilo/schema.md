# `dbo`.`PNVodilo`

_No table description is defined in MSSQL._

- Rows: 24
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DATUM` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `DNEV1` | `float` | Yes | No | No | `` |  |
| 5 | `DNEV2` | `float` | Yes | No | No | `` |  |
| 6 | `DNEV3` | `float` | Yes | No | No | `` |  |
| 7 | `Drzava` | `nvarchar(3)` | Yes | No | No | `` |  |
| 8 | `KM` | `float` | Yes | No | No | `` |  |
| 9 | `KM500` | `float` | Yes | No | No | `` |  |
| 10 | `KMKAMION` | `float` | Yes | No | No | `` |  |
| 11 | `KMKAMION500` | `float` | Yes | No | No | `` |  |
| 12 | `KMKOMBI` | `float` | Yes | No | No | `` |  |
| 13 | `KMKOMBI500` | `float` | Yes | No | No | `` |  |
| 14 | `RecNo` | `int` | No | Yes | No | `` |  |
| 15 | `Valuta` | `nvarchar(5)` | Yes | No | No | `` |  |
| 16 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Drzava` | Yes | NONCLUSTERED | 1 | `Drzava` | No |
| `Drzava` | Yes | NONCLUSTERED | 2 | `DATUM` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
