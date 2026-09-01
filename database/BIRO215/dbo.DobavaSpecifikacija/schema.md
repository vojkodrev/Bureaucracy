# `dbo`.`DobavaSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Carina` | `float` | Yes | No | No | `` |  |
| 3 | `CarinskaStopnja` | `float` | Yes | No | No | `` |  |
| 4 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 5 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 6 | `GroupArt` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 8 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 9 | `Narocilo` | `nvarchar(10)` | Yes | No | No | `` |  |
| 10 | `OdvisniStroski` | `float` | Yes | No | No | `` |  |
| 11 | `ProcentRabata` | `float` | Yes | No | No | `` |  |
| 12 | `ProcentSuperRabata` | `float` | Yes | No | No | `` |  |
| 13 | `ProdajnaCenaObNabavi` | `float` | Yes | No | No | `` |  |
| 14 | `ProdajniDavekObNabavi` | `float` | Yes | No | No | `` |  |
| 15 | `ProdajniSifraDavkaObNabavi` | `nvarchar(5)` | Yes | No | No | `` |  |
| 16 | `RecNo` | `int` | No | Yes | No | `` |  |
| 17 | `SifraDavka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 18 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 19 | `StopnjaDavka` | `decimal(12,6)` | Yes | No | No | `` |  |
| 20 | `TecajValute` | `float` | Yes | No | No | `` |  |
| 21 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 22 | `VValuti` | `float` | Yes | No | No | `` |  |
| 23 | `Znesek` | `float` | Yes | No | No | `` |  |
| 24 | `ZnesekBrezDavka` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 2 | `Artikel` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 3 | `Datum` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 4 | `Kolicina` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 5 | `ProdajnaCenaObNabavi` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 6 | `ProdajniDavekObNabavi` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 7 | `ProdajniSifraDavkaObNabavi` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 8 | `Znesek` | No |
| `DobavaSpecifikacija1` | No | NONCLUSTERED | 9 | `RecNo` | No |
| `Nabava` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Nabava` | No | NONCLUSTERED | 2 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
