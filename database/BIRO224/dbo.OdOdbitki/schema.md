# `dbo`.`OdOdbitki`

_No table description is defined in MSSQL._

- Rows: 9
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Opis` | `nvarchar(40)` | Yes | No | No | `` |  |
| 3 | `RecNo` | `int` | No | Yes | No | `` |  |
| 4 | `Regres` | `smallint` | Yes | No | No | `` |  |
| 5 | `Sifra` | `smallint` | Yes | No | No | `` |  |
| 6 | `Sifra1` | `nvarchar(10)` | Yes | No | No | `` |  |
| 7 | `Sifra2` | `nvarchar(4)` | Yes | No | No | `` |  |
| 8 | `Sifra3` | `nvarchar(4)` | Yes | No | No | `` |  |
| 9 | `SklicObremenitve1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 10 | `SklicObremenitve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 11 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 12 | `Vrsta` | `smallint` | Yes | No | No | `` |  |
| 13 | `VrstaOpis` | `nvarchar(10)` | Yes | No | No | `` |  |
| 14 | `ZRVD` | `nvarchar(3)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `SIfra` | No | NONCLUSTERED | 1 | `Sifra` | No |

## Check constraints

_None._
