# `dbo`.`VrsteDel`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 4 | `OpisArtikla` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `OpisDela` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `SifraDavka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 8 | `SifraDela` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `StopnjaDavka` | `float` | Yes | No | No | `` |  |
| 10 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 11 | `Vrednost` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Sifra` | Yes | NONCLUSTERED | 1 | `SifraDela` | No |
| `Sifra` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
