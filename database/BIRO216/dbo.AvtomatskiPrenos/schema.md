# `dbo`.`AvtomatskiPrenos`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `DoDatuma` | `datetime` | Yes | No | No | `` |  |
| 4 | `ImeStevilke` | `nvarchar(15)` | Yes | No | No | `` |  |
| 5 | `ImeVrste` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `Izvor` | `nvarchar(20)` | Yes | No | No | `` |  |
| 7 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 8 | `NeUpostevaj` | `smallint` | Yes | No | No | `` |  |
| 9 | `Opis` | `nvarchar(100)` | Yes | No | No | `` |  |
| 10 | `Preneseno` | `smallint` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `SaldoBreme` | `float` | Yes | No | No | `` |  |
| 13 | `SaldoDobro` | `float` | Yes | No | No | `` |  |
| 14 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 15 | `StevilkaPrenosa` | `smallint` | Yes | No | No | `` |  |
| 16 | `SteviloKnjizb` | `int` | Yes | No | No | `` |  |
| 17 | `TabelaIzvora` | `nvarchar(20)` | Yes | No | No | `` |  |
| 18 | `TextPrenosa` | `nvarchar(10)` | Yes | No | No | `` |  |
| 19 | `VBreme` | `float` | Yes | No | No | `` |  |
| 20 | `VDobro` | `float` | Yes | No | No | `` |  |
| 21 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 22 | `Vrsta` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `StevilkaPrenosa` | No |

## Check constraints

_None._
