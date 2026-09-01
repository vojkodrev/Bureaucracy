# `dbo`.`DevizniRacuni`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Opis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `OtvoritvenoStanje` | `float` | Yes | No | No | `` |  |
| 4 | `OznakaZaGK` | `nvarchar(2)` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `Sifra` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Valuta` | `nvarchar(10)` | Yes | No | No | `` |  |
| 8 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 9 | `ZR` | `nvarchar(60)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | Yes | NONCLUSTERED | 1 | `Sifra` | No |

## Check constraints

_None._
