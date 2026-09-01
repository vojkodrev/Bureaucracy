# `dbo`.`Klavzule`

_No table description is defined in MSSQL._

- Rows: 8
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CRM` | `smallint` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `IOP` | `smallint` | Yes | No | No | `` |  |
| 4 | `KonecDobavnica` | `smallint` | Yes | No | No | `` |  |
| 5 | `KonecPredracun` | `smallint` | Yes | No | No | `` |  |
| 6 | `KonecRacun` | `smallint` | Yes | No | No | `` |  |
| 7 | `Naziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 8 | `RecNo` | `int` | No | Yes | No | `` |  |
| 9 | `Sifra` | `nvarchar(4)` | Yes | No | No | `` |  |
| 10 | `Sklic` | `smallint` | Yes | No | No | `` |  |
| 11 | `SklicPartner` | `smallint` | Yes | No | No | `` |  |
| 12 | `TextKlavzule` | `ntext` | Yes | No | No | `` |  |
| 13 | `UvodDobavnica` | `smallint` | Yes | No | No | `` |  |
| 14 | `UvodPredracun` | `smallint` | Yes | No | No | `` |  |
| 15 | `UvodRacun` | `smallint` | Yes | No | No | `` |  |
| 16 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 17 | `Vrsta` | `nvarchar(50)` | Yes | No | No | `` |  |

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
