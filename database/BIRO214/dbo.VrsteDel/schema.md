# `dbo`.`VrsteDel`

_No table description is defined in MSSQL._

- Rows: 5
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `DavcnaSkupina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `DURS` | `nvarchar(4)` | Yes | No | No | `` |  |
| 5 | `Ime` | `nvarchar(40)` | Yes | No | No | `` |  |
| 6 | `IzpisiNormal` | `smallint` | Yes | No | No | `` |  |
| 7 | `IzpisiSkrajsano` | `smallint` | Yes | No | No | `` |  |
| 8 | `IzpisiZavod` | `smallint` | Yes | No | No | `` |  |
| 9 | `NazivZaAgencijo` | `nvarchar(100)` | Yes | No | No | `` |  |
| 10 | `Normirano` | `float` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `Sifra` | `nvarchar(2)` | Yes | No | No | `` |  |
| 13 | `Sifra1` | `nvarchar(10)` | Yes | No | No | `` |  |
| 14 | `Sifra1Ostalo` | `nvarchar(10)` | Yes | No | No | `` |  |
| 15 | `Sifra2` | `nvarchar(4)` | Yes | No | No | `` |  |
| 16 | `Sifra2Ostalo` | `nvarchar(4)` | Yes | No | No | `` |  |
| 17 | `Sifra3` | `nvarchar(4)` | Yes | No | No | `` |  |
| 18 | `Sifra3Ostalo` | `nvarchar(4)` | Yes | No | No | `` |  |
| 19 | `SklicObremenitve1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 20 | `SklicObremenitve1Ostalo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 21 | `SklicObremenitve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 22 | `SklicObremenitve2Ostalo` | `nvarchar(25)` | Yes | No | No | `` |  |
| 23 | `Student` | `smallint` | Yes | No | No | `` |  |
| 24 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 25 | `VrstaOsebnegaPrejemka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 26 | `ZRVD` | `nvarchar(3)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | Yes | NONCLUSTERED | 1 | `Sifra` | No |

## Check constraints

_None._
