# `dbo`.`KONTO`

_No table description is defined in MSSQL._

- Rows: 582
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `AnalitikaOtvoritve` | `smallint` | Yes | No | No | `` |  |
| 2 | `AOP1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 3 | `AOP2` | `nvarchar(5)` | Yes | No | No | `` |  |
| 4 | `AOP3` | `nvarchar(5)` | Yes | No | No | `` |  |
| 5 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 6 | `Knjigovodstvo` | `smallint` | Yes | No | No | `` |  |
| 7 | `KONTO` | `nvarchar(10)` | Yes | No | No | `` |  |
| 8 | `NAZIV` | `nvarchar(255)` | Yes | No | No | `` |  |
| 9 | `OKRAJSAVA` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `OznakaFinancnegaInstrumenta` | `int` | Yes | No | No | `` |  |
| 11 | `PredznakAOP1` | `smallint` | Yes | No | No | `` |  |
| 12 | `PredznakAOP2` | `smallint` | Yes | No | No | `` |  |
| 13 | `PredznakAOP3` | `smallint` | Yes | No | No | `` |  |
| 14 | `RecNo` | `int` | No | Yes | No | `` |  |
| 15 | `SKIS` | `nvarchar(6)` | Yes | No | No | `` |  |
| 16 | `TerjatevObveznost` | `smallint` | Yes | No | No | `` |  |
| 17 | `VELJA` | `nvarchar(1)` | Yes | No | No | `` |  |
| 18 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 19 | `VRSTA` | `nvarchar(1)` | Yes | No | No | `` |  |
| 20 | `VrstaKonta` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Konto` | Yes | NONCLUSTERED | 1 | `KONTO` | No |
| `Konto` | Yes | NONCLUSTERED | 2 | `Knjigovodstvo` | No |
| `Naziv` | No | NONCLUSTERED | 1 | `OKRAJSAVA` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
