# `dbo`.`OdDavki`

_No table description is defined in MSSQL._

- Rows: 22
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Davek` | `decimal(12,6)` | Yes | No | No | `` |  |
| 3 | `DavekNaBruto` | `smallint` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `Dohodnina` | `smallint` | Yes | No | No | `` |  |
| 6 | `Ime` | `nvarchar(40)` | Yes | No | No | `` |  |
| 7 | `MesecObracuna` | `datetime` | Yes | No | No | `` |  |
| 8 | `NamenNakazila1` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `NamenNakazila1SP` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `NamenNakazila2` | `nvarchar(50)` | Yes | No | No | `` |  |
| 11 | `NamenNakazila2SP` | `nvarchar(50)` | Yes | No | No | `` |  |
| 12 | `PavsalniZnesek` | `float` | Yes | No | No | `` |  |
| 13 | `PokojninskoZavarovanje` | `smallint` | Yes | No | No | `` |  |
| 14 | `PosebniObracunZaMinimalnoPlaco` | `smallint` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `REK1` | `smallint` | Yes | No | No | `` |  |
| 17 | `Sifra` | `nvarchar(3)` | Yes | No | No | `` |  |
| 18 | `Sifra1` | `nvarchar(10)` | Yes | No | No | `` |  |
| 19 | `Sifra2` | `nvarchar(4)` | Yes | No | No | `` |  |
| 20 | `Sifra3` | `nvarchar(4)` | Yes | No | No | `` |  |
| 21 | `SklicObremenitve1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 22 | `SklicObremenitve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 23 | `SklicOdobritve1` | `nvarchar(4)` | Yes | No | No | `` |  |
| 24 | `SklicOdobritve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 25 | `SklicOdobritve3` | `nvarchar(8)` | Yes | No | No | `` |  |
| 26 | `VBremeKoga` | `nvarchar(30)` | Yes | No | No | `` |  |
| 27 | `VDobroracuna` | `nvarchar(60)` | Yes | No | No | `` |  |
| 28 | `VdobroRacuna2` | `nvarchar(100)` | Yes | No | No | `` |  |
| 29 | `VDobroRacunaSP1` | `nvarchar(60)` | Yes | No | No | `` |  |
| 30 | `VDobroRacunaSP2` | `nvarchar(100)` | Yes | No | No | `` |  |
| 31 | `VeljaZaObcino` | `nvarchar(5)` | Yes | No | No | `` |  |
| 32 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 33 | `VrstaDavka` | `smallint` | Yes | No | No | `` |  |
| 34 | `ZiroRacun` | `nvarchar(60)` | Yes | No | No | `` |  |
| 35 | `ZPIS` | `smallint` | Yes | No | No | `` |  |
| 36 | `ZRVD` | `nvarchar(3)` | Yes | No | No | `` |  |
| 37 | `ZRVDSP` | `nvarchar(3)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | No | NONCLUSTERED | 1 | `Sifra` | No |
| `SifraMesec` | Yes | NONCLUSTERED | 1 | `Sifra` | No |
| `SifraMesec` | Yes | NONCLUSTERED | 2 | `MesecObracuna` | No |

## Check constraints

_None._
