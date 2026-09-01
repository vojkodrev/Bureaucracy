# `dbo`.`ODObracunanaDela`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Dodatek1` | `float` | Yes | No | No | `` |  |
| 3 | `Dodatek2` | `float` | Yes | No | No | `` |  |
| 4 | `Dodatek3` | `float` | Yes | No | No | `` |  |
| 5 | `Dodatek4` | `float` | Yes | No | No | `` |  |
| 6 | `Komentar` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `KonkurencnaKlavzula` | `decimal(12,6)` | Yes | No | No | `` |  |
| 8 | `MinuloDelo` | `decimal(12,6)` | Yes | No | No | `` |  |
| 9 | `OD` | `smallint` | Yes | No | No | `` |  |
| 10 | `OpisDela` | `nvarchar(40)` | Yes | No | No | `` |  |
| 11 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 12 | `Procent` | `float` | Yes | No | No | `` |  |
| 13 | `RecNo` | `int` | No | Yes | No | `` |  |
| 14 | `Refundacija` | `smallint` | Yes | No | No | `` |  |
| 15 | `Sifra` | `smallint` | Yes | No | No | `` |  |
| 16 | `Stalnost` | `decimal(12,6)` | Yes | No | No | `` |  |
| 17 | `StalnostTrenutno` | `decimal(12,6)` | Yes | No | No | `` |  |
| 18 | `Stimulacija` | `decimal(12,6)` | Yes | No | No | `` |  |
| 19 | `Ure` | `decimal(12,6)` | Yes | No | No | `` |  |
| 20 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 21 | `VrednostUre` | `float` | Yes | No | No | `` |  |

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
