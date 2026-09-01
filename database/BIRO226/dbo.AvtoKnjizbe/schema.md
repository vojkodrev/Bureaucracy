# `dbo`.`AvtoKnjizbe`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `BESEDILO` | `nvarchar(100)` | Yes | No | No | `` |  |
| 2 | `BREME` | `float` | Yes | No | No | `` |  |
| 3 | `BREMEVALUTA` | `float` | Yes | No | No | `` |  |
| 4 | `DATUM` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumKnjizenja` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumOdpremeStoritve` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 8 | `DatumTemeljnice` | `datetime` | Yes | No | No | `` |  |
| 9 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 10 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 11 | `DOBRO` | `float` | Yes | No | No | `` |  |
| 12 | `DOBROVALUTA` | `float` | Yes | No | No | `` |  |
| 13 | `KONTO` | `nvarchar(10)` | Yes | No | No | `` |  |
| 14 | `MDL1` | `nvarchar(30)` | Yes | No | No | `` |  |
| 15 | `MDL2` | `nvarchar(20)` | Yes | No | No | `` |  |
| 16 | `NacinPlacila` | `smallint` | Yes | No | No | `` |  |
| 17 | `OE` | `nvarchar(30)` | Yes | No | No | `` |  |
| 18 | `OznakaValute` | `nvarchar(3)` | Yes | No | No | `` |  |
| 19 | `PARTNER` | `nvarchar(10)` | Yes | No | No | `` |  |
| 20 | `PKONTO` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `RecNo` | `int` | No | Yes | No | `` |  |
| 22 | `StatusDDV` | `smallint` | Yes | No | No | `` |  |
| 23 | `STEV_DOK` | `nvarchar(20)` | Yes | No | No | `` |  |
| 24 | `TecajVALUTE` | `float` | Yes | No | No | `` |  |
| 25 | `Temeljnica` | `smallint` | Yes | No | No | `` |  |
| 26 | `TempZapis` | `float` | Yes | No | No | `` |  |
| 27 | `Urejenost` | `smallint` | Yes | No | No | `` |  |
| 28 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 29 | `VrstaDokumenta` | `nvarchar(10)` | Yes | No | No | `` |  |
| 30 | `VrstaTemeljnice` | `smallint` | Yes | No | No | `` |  |
| 31 | `ZAPIS` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `AA1` | No | NONCLUSTERED | 1 | `Temeljnica` | No |
| `AA1` | No | NONCLUSTERED | 2 | `DATUM` | No |
| `AA1` | No | NONCLUSTERED | 3 | `STEV_DOK` | No |
| `AA1` | No | NONCLUSTERED | 4 | `RecNo` | No |
| `AA2` | No | NONCLUSTERED | 1 | `Temeljnica` | No |
| `AA2` | No | NONCLUSTERED | 2 | `DATUM` | No |
| `AA2` | No | NONCLUSTERED | 3 | `RecNo` | No |
| `AAA` | No | NONCLUSTERED | 1 | `Urejenost` | No |
| `AAA` | No | NONCLUSTERED | 2 | `Temeljnica` | No |
| `AAA` | No | NONCLUSTERED | 3 | `DATUM` | No |
| `AAA` | No | NONCLUSTERED | 4 | `STEV_DOK` | No |
| `AAA` | No | NONCLUSTERED | 5 | `ZAPIS` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Zapis` | No | NONCLUSTERED | 1 | `ZAPIS` | No |

## Check constraints

_None._
