# `dbo`.`NastavitveAvtoGK`

_No table description is defined in MSSQL._

- Rows: 1032
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumPlacila` | `smallint` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `DatumZapadlosti` | `smallint` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `DodajOznakoZaKonto` | `smallint` | Yes | No | No | `` |  |
| 6 | `DodajOznakoZaPKonto` | `smallint` | Yes | No | No | `` |  |
| 7 | `DopolnjenoSSpecifikacijo` | `smallint` | Yes | No | No | `` |  |
| 8 | `KONTO` | `nvarchar(10)` | Yes | No | No | `` |  |
| 9 | `KontraKnjizba` | `smallint` | Yes | No | No | `` |  |
| 10 | `NacinPlacila` | `smallint` | Yes | No | No | `` |  |
| 11 | `Naziv` | `nvarchar(100)` | Yes | No | No | `` |  |
| 12 | `NeOpozoriZaNastavitev` | `smallint` | Yes | No | No | `` |  |
| 13 | `OpisDokumenta` | `nvarchar(5)` | Yes | No | No | `` |  |
| 14 | `PKONTO` | `nvarchar(10)` | Yes | No | No | `` |  |
| 15 | `PoslovniDogodek` | `nvarchar(100)` | Yes | No | No | `` |  |
| 16 | `ProcentKnjizbe` | `float` | Yes | No | No | `` |  |
| 17 | `RecNo` | `int` | No | Yes | No | `` |  |
| 18 | `SifraVSifrantu` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `TextKontra` | `nvarchar(2)` | Yes | No | No | `` |  |
| 20 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 21 | `VrstaKnjizbe` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `AvtoGK` | No | NONCLUSTERED | 1 | `PoslovniDogodek` | No |
| `AvtoGK` | No | NONCLUSTERED | 2 | `SifraVSifrantu` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
