# `dbo`.`SpremembeCenSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 3 | `DosedanjaCenaNaME` | `float` | Yes | No | No | `` |  |
| 4 | `DosedanjaVrednostZaloge` | `float` | Yes | No | No | `` |  |
| 5 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 6 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 7 | `NovaCenaNaME` | `float` | Yes | No | No | `` |  |
| 8 | `NovaVrednostZaloge` | `float` | Yes | No | No | `` |  |
| 9 | `PDvDosedanjiZalogi` | `float` | Yes | No | No | `` |  |
| 10 | `PDvNoviZalogi` | `float` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |

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
