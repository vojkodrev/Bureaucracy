# `dbo`.`Dobava`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `CenaProdaja` | `float` | Yes | No | No | `` |  |
| 2 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumTecaja` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 5 | `DavekProdaja` | `float` | Yes | No | No | `` |  |
| 6 | `GK` | `smallint` | Yes | No | No | `` |  |
| 7 | `ImeDobavitelja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 8 | `IzvorInterneDobave` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `Narocilo` | `nvarchar(10)` | Yes | No | No | `` |  |
| 11 | `OpisDobavnce` | `nvarchar(120)` | Yes | No | No | `` |  |
| 12 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `Prevzel` | `nvarchar(5)` | Yes | No | No | `` |  |
| 14 | `Prevzemnik` | `nvarchar(30)` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `RokPlacila` | `datetime` | Yes | No | No | `` |  |
| 17 | `SifraDobavitelja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 18 | `Skladisce` | `nvarchar(1)` | Yes | No | No | `` |  |
| 19 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 20 | `StevilkaPlacila` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 22 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 23 | `Valuta` | `nvarchar(10)` | Yes | No | No | `` |  |
| 24 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 25 | `VrstaDobave` | `smallint` | Yes | No | No | `` |  |
| 26 | `ZnesekDobavnice` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `ImeDobavitelja` | No | NONCLUSTERED | 1 | `ImeDobavitelja` | No |
| `Opis` | No | NONCLUSTERED | 1 | `ImeDobavitelja` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
