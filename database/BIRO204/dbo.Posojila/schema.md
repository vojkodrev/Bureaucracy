# `dbo`.`Posojila`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumSklenitve` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `DatumVracila` | `datetime` | Yes | No | No | `` |  |
| 4 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 5 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 6 | `OdprtiZnesekGlavnice` | `float` | Yes | No | No | `` |  |
| 7 | `OznakaLeta` | `nvarchar(2)` | Yes | No | No | `` |  |
| 8 | `RecNo` | `int` | No | Yes | No | `` |  |
| 9 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 10 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 11 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 12 | `VrstaPosojila` | `smallint` | Yes | No | No | `` |  |
| 13 | `VrstaPosojilaOpis` | `nvarchar(20)` | Yes | No | No | `` |  |
| 14 | `ZnesekGlavnice` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `OznakaLeta` | No |
| `Stevilka` | No | NONCLUSTERED | 2 | `Stevilka` | No |

## Check constraints

_None._
