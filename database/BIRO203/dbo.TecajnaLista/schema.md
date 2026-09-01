# `dbo`.`TecajnaLista`

_No table description is defined in MSSQL._

- Rows: 5
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `Enota` | `smallint` | Yes | No | No | `` |  |
| 5 | `ImeValute` | `nvarchar(20)` | Yes | No | No | `` |  |
| 6 | `NakupniMenjalniski` | `float` | Yes | No | No | `` |  |
| 7 | `NakupniPodjetniski` | `float` | Yes | No | No | `` |  |
| 8 | `ProdajniMenjalniski` | `float` | Yes | No | No | `` |  |
| 9 | `ProdajniPodjetniski` | `float` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `SifraValute` | `nvarchar(3)` | Yes | No | No | `` |  |
| 12 | `Srednji` | `float` | Yes | No | No | `` |  |
| 13 | `VALUTA` | `nvarchar(3)` | Yes | No | No | `` |  |
| 14 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `ValutaInDatum` | Yes | NONCLUSTERED | 1 | `VALUTA` | No |
| `ValutaInDatum` | Yes | NONCLUSTERED | 2 | `Datum` | No |

## Check constraints

_None._
