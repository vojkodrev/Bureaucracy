# `dbo`.`PrometniDavekObracunano`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `Datum1` | `datetime` | Yes | No | No | `` |  |
| 3 | `Datum2` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 6 | `DDVO1` | `ntext` | Yes | No | No | `` |  |
| 7 | `DDVO2` | `ntext` | Yes | No | No | `` |  |
| 8 | `DDVO3` | `ntext` | Yes | No | No | `` |  |
| 9 | `GK` | `smallint` | Yes | No | No | `` |  |
| 10 | `Nabava` | `ntext` | Yes | No | No | `` |  |
| 11 | `PovraciloDavka` | `smallint` | Yes | No | No | `` |  |
| 12 | `Prodaja` | `ntext` | Yes | No | No | `` |  |
| 13 | `RecNo` | `int` | No | Yes | No | `` |  |
| 14 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 15 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaDDV` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaDDV` | Yes | NONCLUSTERED | 2 | `DDV` | No |

## Check constraints

_None._
