# `dbo`.`CekiSaldo`

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
| 6 | `Besedilo6` | `nvarchar(80)` | Yes | No | No | `` |  |
| 7 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 8 | `GK` | `smallint` | Yes | No | No | `` |  |
| 9 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 10 | `ImeVrsteDogodka` | `nvarchar(80)` | Yes | No | No | `` |  |
| 11 | `KrajPartnerja` | `nvarchar(32)` | Yes | No | No | `` |  |
| 12 | `Partner` | `nvarchar(10)` | Yes | No | No | `` |  |
| 13 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `Priloge` | `nvarchar(80)` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `Sifradavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 17 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 18 | `VrstaDogodka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 19 | `Znesek` | `float` | Yes | No | No | `` |  |
| 20 | `Znesek1` | `float` | Yes | No | No | `` |  |
| 21 | `Znesek2` | `float` | Yes | No | No | `` |  |
| 22 | `Znesek3` | `float` | Yes | No | No | `` |  |
| 23 | `Znesek4` | `float` | Yes | No | No | `` |  |
| 24 | `Znesek5` | `float` | Yes | No | No | `` |  |
| 25 | `Znesek6` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `Prejemek` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
