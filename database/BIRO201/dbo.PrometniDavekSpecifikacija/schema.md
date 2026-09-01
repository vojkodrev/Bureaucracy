# `dbo`.`PrometniDavekSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `BookNo` | `smallint` | Yes | No | No | `` |  |
| 2 | `Col` | `smallint` | Yes | No | No | `` |  |
| 3 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 4 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 5 | `NazivPD` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `ObracunskiDatum1` | `datetime` | Yes | No | No | `` |  |
| 7 | `ObracunskiDatum2` | `datetime` | Yes | No | No | `` |  |
| 8 | `Opis` | `nvarchar(100)` | Yes | No | No | `` |  |
| 9 | `Oznaka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 10 | `OznakaPD` | `nvarchar(5)` | Yes | No | No | `` |  |
| 11 | `Povzetek` | `smallint` | Yes | No | No | `` |  |
| 12 | `RecNo` | `int` | No | Yes | No | `` |  |
| 13 | `Row` | `smallint` | Yes | No | No | `` |  |
| 14 | `Stevilka` | `smallint` | Yes | No | No | `` |  |
| 15 | `Znesek` | `float` | Yes | No | No | `` |  |
| 16 | `ZR` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `PD` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
