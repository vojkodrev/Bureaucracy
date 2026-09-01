# `dbo`.`PNalogSpecifikacijaObracunaKM`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Cena` | `float` | Yes | No | No | `` |  |
| 2 | `Drzava` | `nvarchar(5)` | Yes | No | No | `` |  |
| 3 | `DrzavaIme` | `nvarchar(25)` | Yes | No | No | `` |  |
| 4 | `PN` | `float` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `Stevilo` | `smallint` | Yes | No | No | `` |  |

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
