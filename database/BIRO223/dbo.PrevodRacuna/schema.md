# `dbo`.`PrevodRacuna`

_No table description is defined in MSSQL._

- Rows: 55
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Drzava` | `nvarchar(5)` | Yes | No | No | `` |  |
| 3 | `Jezik` | `nvarchar(3)` | Yes | No | No | `` |  |
| 4 | `Pozicija` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `Prevod` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `Valuta` | `nvarchar(5)` | Yes | No | No | `` |  |
| 8 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `PrevodRacuna` | No | NONCLUSTERED | 1 | `Jezik` | No |
| `PrevodRacuna` | No | NONCLUSTERED | 2 | `Pozicija` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
