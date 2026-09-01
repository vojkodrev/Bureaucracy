# `dbo`.`BazaPogodb`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Naziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `RecNo` | `int` | No | Yes | No | `` |  |
| 4 | `Sifra` | `nvarchar(6)` | Yes | No | No | `` |  |
| 5 | `SteviloPogodb` | `smallint` | Yes | No | No | `` |  |
| 6 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 7 | `VrstaHonorarja` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | No | NONCLUSTERED | 1 | `Sifra` | No |

## Check constraints

_None._
