# `dbo`.`Blagajna`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Besedilo1` | `nvarchar(80)` | Yes | No | No | `` |  |
| 2 | `Besedilo2` | `nvarchar(80)` | Yes | No | No | `` |  |
| 3 | `Besedilo3` | `nvarchar(80)` | Yes | No | No | `` |  |
| 4 | `Besedilo4` | `nvarchar(80)` | Yes | No | No | `` |  |
| 5 | `Besedilo5` | `nvarchar(80)` | Yes | No | No | `` |  |
| 6 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 8 | `GK` | `smallint` | Yes | No | No | `` |  |
| 9 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 10 | `ImeVrsteDogodka` | `nvarchar(80)` | Yes | No | No | `` |  |
| 11 | `ImeVrsteDogodka1` | `nvarchar(80)` | Yes | No | No | `` |  |
| 12 | `ImeVrsteDogodka2` | `nvarchar(80)` | Yes | No | No | `` |  |
| 13 | `ImeVrsteDogodka3` | `nvarchar(80)` | Yes | No | No | `` |  |
| 14 | `ImeVrsteDogodka4` | `nvarchar(80)` | Yes | No | No | `` |  |
| 15 | `ImeVrsteDogodka5` | `nvarchar(80)` | Yes | No | No | `` |  |
| 16 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 17 | `OznakaBlagajne` | `nvarchar(2)` | Yes | No | No | `` |  |
| 18 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `POSStevilka` | `smallint` | Yes | No | No | `` |  |
| 20 | `PotniNalog` | `nvarchar(100)` | Yes | No | No | `` |  |
| 21 | `Priloge` | `nvarchar(80)` | Yes | No | No | `` |  |
| 22 | `RecNo` | `int` | No | Yes | No | `` |  |
| 23 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 24 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 25 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 26 | `vrsta` | `smallint` | Yes | No | No | `` |  |
| 27 | `VrstaDogodka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 28 | `VrstaDogodka1` | `nvarchar(2)` | Yes | No | No | `` |  |
| 29 | `VrstaDogodka2` | `nvarchar(2)` | Yes | No | No | `` |  |
| 30 | `VrstaDogodka3` | `nvarchar(2)` | Yes | No | No | `` |  |
| 31 | `VrstaDogodka4` | `nvarchar(2)` | Yes | No | No | `` |  |
| 32 | `VrstaDogodka5` | `nvarchar(2)` | Yes | No | No | `` |  |
| 33 | `Znesek` | `float` | Yes | No | No | `` |  |
| 34 | `Znesek1` | `float` | Yes | No | No | `` |  |
| 35 | `Znesek2` | `float` | Yes | No | No | `` |  |
| 36 | `Znesek3` | `float` | Yes | No | No | `` |  |
| 37 | `Znesek4` | `float` | Yes | No | No | `` |  |
| 38 | `Znesek5` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
