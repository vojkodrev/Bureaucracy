# `dbo`.`BankaZRObveznosti`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Banka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 5 | `Opomba` | `nvarchar(150)` | Yes | No | No | `` |  |
| 6 | `Otvoritev` | `smallint` | Yes | No | No | `` |  |
| 7 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 8 | `RecNo` | `int` | No | Yes | No | `` |  |
| 9 | `RokPlacila` | `datetime` | Yes | No | No | `` |  |
| 10 | `Sifra1` | `nvarchar(6)` | Yes | No | No | `` |  |
| 11 | `Sifra2` | `nvarchar(2)` | Yes | No | No | `` |  |
| 12 | `Sifra3` | `nvarchar(2)` | Yes | No | No | `` |  |
| 13 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 14 | `Sklic1` | `nvarchar(6)` | Yes | No | No | `` |  |
| 15 | `Sklic2` | `nvarchar(50)` | Yes | No | No | `` |  |
| 16 | `VBreme` | `float` | Yes | No | No | `` |  |
| 17 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 18 | `VrstaDogodka` | `smallint` | Yes | No | No | `` |  |
| 19 | `ZaporednaStevilka` | `int` | Yes | No | No | `` |  |
| 20 | `ZiroRacun` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
