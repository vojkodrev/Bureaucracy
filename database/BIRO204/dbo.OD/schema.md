# `dbo`.`OD`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Bonitete` | `float` | Yes | No | No | `` |  |
| 2 | `BrutoRealno` | `float` | Yes | No | No | `` |  |
| 3 | `BrutoRefundirano` | `float` | Yes | No | No | `` |  |
| 4 | `DatumIzplacila` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumObracuna` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 7 | `GK` | `smallint` | Yes | No | No | `` |  |
| 8 | `ImeZaposlenega` | `nvarchar(40)` | Yes | No | No | `` |  |
| 9 | `MesecniDelovnik` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `MesecObracuna` | `datetime` | Yes | No | No | `` |  |
| 11 | `MinuloDelo` | `decimal(12,6)` | Yes | No | No | `` |  |
| 12 | `Netto` | `float` | Yes | No | No | `` |  |
| 13 | `ObracunskeUre` | `float` | Yes | No | No | `` |  |
| 14 | `OdbitkiDodatki` | `float` | Yes | No | No | `` |  |
| 15 | `OsnovaZaDohodnino` | `float` | Yes | No | No | `` |  |
| 16 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 17 | `RecNo` | `int` | No | Yes | No | `` |  |
| 18 | `RefundiraneUre` | `float` | Yes | No | No | `` |  |
| 19 | `Regres` | `float` | Yes | No | No | `` |  |
| 20 | `SkupajUr` | `decimal(12,6)` | Yes | No | No | `` |  |
| 21 | `Stalnost` | `decimal(12,6)` | Yes | No | No | `` |  |
| 22 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 23 | `Stimulacija` | `decimal(12,6)` | Yes | No | No | `` |  |
| 24 | `VladaPrehrana` | `float` | Yes | No | No | `` |  |
| 25 | `VladaPrevoz` | `float` | Yes | No | No | `` |  |
| 26 | `VladaRegres` | `float` | Yes | No | No | `` |  |
| 27 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 28 | `VrednostUre` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Bruto` | No | NONCLUSTERED | 1 | `BrutoRealno` | No |
| `Bruto` | No | NONCLUSTERED | 2 | `BrutoRefundirano` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
