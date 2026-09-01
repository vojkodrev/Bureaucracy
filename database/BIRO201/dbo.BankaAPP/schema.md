# `dbo`.`BankaAPP`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `ImePartnerja` | `nvarchar(80)` | Yes | No | No | `` |  |
| 4 | `NamenNakazila` | `nvarchar(100)` | Yes | No | No | `` |  |
| 5 | `Poslano` | `smallint` | Yes | No | No | `` |  |
| 6 | `RacunZaPlacilo` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `Sifra1` | `nvarchar(6)` | Yes | No | No | `` |  |
| 9 | `Sifra2` | `nvarchar(5)` | Yes | No | No | `` |  |
| 10 | `Sifra3` | `nvarchar(5)` | Yes | No | No | `` |  |
| 11 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `SklicObremenitve` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `SklicOdobritve` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `VBreme` | `float` | Yes | No | No | `` |  |
| 15 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 16 | `ZiroRacun` | `nvarchar(30)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `AAA` | No | NONCLUSTERED | 1 | `Datum` | No |
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
