# `dbo`.`NarociloDobavitelj`

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
| 6 | `DostavnoMesto` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `GK` | `smallint` | Yes | No | No | `` |  |
| 8 | `ImeDobavitelja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 9 | `Jezik` | `nvarchar(5)` | Yes | No | No | `` |  |
| 10 | `Klavzula` | `ntext` | Yes | No | No | `` |  |
| 11 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 12 | `NacinPlacila` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `Narocilo` | `nvarchar(10)` | Yes | No | No | `` |  |
| 14 | `OpisDobavnce` | `nvarchar(40)` | Yes | No | No | `` |  |
| 15 | `Predloga` | `nvarchar(50)` | Yes | No | No | `` |  |
| 16 | `Prevzel` | `nvarchar(5)` | Yes | No | No | `` |  |
| 17 | `Prevzemnik` | `nvarchar(30)` | Yes | No | No | `` |  |
| 18 | `RecNo` | `int` | No | Yes | No | `` |  |
| 19 | `RokDobave` | `datetime` | Yes | No | No | `` |  |
| 20 | `RokPlacila` | `datetime` | Yes | No | No | `` |  |
| 21 | `SifraDobavitelja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 22 | `Skladisce` | `nvarchar(1)` | Yes | No | No | `` |  |
| 23 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 24 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 25 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 26 | `Valuta` | `nvarchar(10)` | Yes | No | No | `` |  |
| 27 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 28 | `VrstaDobave` | `smallint` | Yes | No | No | `` |  |
| 29 | `ZnesekDobavnice` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `ImeDobavitelja` | No | NONCLUSTERED | 1 | `ImeDobavitelja` | No |
| `Opis` | No | NONCLUSTERED | 1 | `ImeDobavitelja` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
