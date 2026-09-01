# `dbo`.`PNPoti`

_No table description is defined in MSSQL._

- Rows: 2
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CESTNINA` | `float` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `Drzava` | `nvarchar(3)` | Yes | No | No | `` |  |
| 5 | `IME` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `KM` | `float` | Yes | No | No | `` |  |
| 7 | `MestoOdhoda` | `nvarchar(40)` | Yes | No | No | `` |  |
| 8 | `MestoPrihoda` | `nvarchar(40)` | Yes | No | No | `` |  |
| 9 | `RecNo` | `int` | No | Yes | No | `` |  |
| 10 | `SIFRA` | `nvarchar(3)` | Yes | No | No | `` |  |
| 11 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Drzava` | Yes | NONCLUSTERED | 1 | `Drzava` | No |
| `Drzava` | Yes | NONCLUSTERED | 2 | `SIFRA` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | Yes | NONCLUSTERED | 1 | `SIFRA` | No |

## Check constraints

_None._
