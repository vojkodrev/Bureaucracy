# `dbo`.`ODObracunaniDavki`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumObracuna` | `datetime` | Yes | No | No | `` |  |
| 2 | `Davek` | `decimal(12,6)` | Yes | No | No | `` |  |
| 3 | `Ime` | `nvarchar(60)` | Yes | No | No | `` |  |
| 4 | `MesecObracuna` | `datetime` | Yes | No | No | `` |  |
| 5 | `OD` | `smallint` | Yes | No | No | `` |  |
| 6 | `ProcentIzBonitete` | `float` | Yes | No | No | `` |  |
| 7 | `ProcentIzBruta` | `float` | Yes | No | No | `` |  |
| 8 | `ProcentIzRegresa` | `float` | Yes | No | No | `` |  |
| 9 | `RecNo` | `int` | No | Yes | No | `` |  |
| 10 | `REK1` | `smallint` | Yes | No | No | `` |  |
| 11 | `Sifra` | `nvarchar(3)` | Yes | No | No | `` |  |
| 12 | `VrstaDavka` | `smallint` | Yes | No | No | `` |  |
| 13 | `Znesek` | `float` | Yes | No | No | `` |  |

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
