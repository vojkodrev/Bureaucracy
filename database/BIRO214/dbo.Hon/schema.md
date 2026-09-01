# `dbo`.`Hon`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `BrutoRealno` | `float` | Yes | No | No | `` |  |
| 2 | `DatumIzplacila` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumObracuna` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumPogodbe` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 6 | `DavcniBruto` | `float` | Yes | No | No | `` |  |
| 7 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 8 | `GK` | `smallint` | Yes | No | No | `` |  |
| 9 | `ImeZaposlenega` | `nvarchar(40)` | Yes | No | No | `` |  |
| 10 | `NazivProjekta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 11 | `Netto` | `float` | Yes | No | No | `` |  |
| 12 | `OdbitkiDodatki` | `float` | Yes | No | No | `` |  |
| 13 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `Pricetek` | `datetime` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `Rok` | `datetime` | Yes | No | No | `` |  |
| 17 | `SkupajUr` | `decimal(12,6)` | Yes | No | No | `` |  |
| 18 | `Stalnost` | `decimal(12,6)` | Yes | No | No | `` |  |
| 19 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 20 | `Stimulacija` | `decimal(12,6)` | Yes | No | No | `` |  |
| 21 | `TipUre` | `nvarchar(20)` | Yes | No | No | `` |  |
| 22 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 23 | `VrednostUre` | `float` | Yes | No | No | `` |  |
| 24 | `VrstaHonorarja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 25 | `VrstaPogodbe` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
