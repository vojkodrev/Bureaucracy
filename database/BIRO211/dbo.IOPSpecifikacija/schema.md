# `dbo`.`IOPSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 161
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumDokumenta` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumZapadlostiDokumenta` | `datetime` | Yes | No | No | `` |  |
| 4 | `DodatnaStevilkaDokumenta` | `nvarchar(20)` | Yes | No | No | `` |  |
| 5 | `Dokument` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `OznakaLeta` | `nvarchar(5)` | Yes | No | No | `` |  |
| 7 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 8 | `RecNo` | `int` | No | Yes | No | `` |  |
| 9 | `SaldoDokumenta` | `float` | Yes | No | No | `` |  |
| 10 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 11 | `StevilkaDokumenta` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `VrstaDogodka` | `smallint` | Yes | No | No | `` |  |
| 13 | `ZnesekDokumenta` | `float` | Yes | No | No | `` |  |
| 14 | `ZnesekPlacila` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | No | NONCLUSTERED | 2 | `Dokument` | No |

## Check constraints

_None._
