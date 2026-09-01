# `dbo`.`HonDavki`

_No table description is defined in MSSQL._

- Rows: 7
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Davek` | `decimal(12,6)` | Yes | No | No | `` |  |
| 3 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `Ime` | `nvarchar(60)` | Yes | No | No | `` |  |
| 6 | `OpisHonorarja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 7 | `Pavsal` | `float` | Yes | No | No | `` |  |
| 8 | `RecNo` | `int` | No | Yes | No | `` |  |
| 9 | `REK2` | `smallint` | Yes | No | No | `` |  |
| 10 | `Sifra` | `nvarchar(2)` | Yes | No | No | `` |  |
| 11 | `Sifra1` | `nvarchar(6)` | Yes | No | No | `` |  |
| 12 | `Sifra2` | `nvarchar(4)` | Yes | No | No | `` |  |
| 13 | `Sifra3` | `nvarchar(4)` | Yes | No | No | `` |  |
| 14 | `SklicObremenitve1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 15 | `SklicObremenitve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 16 | `SklicOdobritve1` | `nvarchar(4)` | Yes | No | No | `` |  |
| 17 | `SklicOdobritve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 18 | `VDobroracuna` | `nvarchar(60)` | Yes | No | No | `` |  |
| 19 | `VdobroRacuna2` | `nvarchar(100)` | Yes | No | No | `` |  |
| 20 | `VeljaZaObcino` | `nvarchar(5)` | Yes | No | No | `` |  |
| 21 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 22 | `VrstaDajatve` | `smallint` | Yes | No | No | `` |  |
| 23 | `VrstaHonorarja` | `nvarchar(2)` | Yes | No | No | `` |  |
| 24 | `ZiroRacun` | `nvarchar(60)` | Yes | No | No | `` |  |
| 25 | `ZRVD` | `nvarchar(3)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | No | NONCLUSTERED | 1 | `Sifra` | No |
| `VrstaHonorarja` | No | NONCLUSTERED | 1 | `VrstaHonorarja` | No |

## Check constraints

_None._
