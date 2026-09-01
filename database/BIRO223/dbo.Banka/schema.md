# `dbo`.`Banka`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 3 | `DodatnaProvizijaVSIT` | `float` | Yes | No | No | `` |  |
| 4 | `DodatniOpis` | `nvarchar(100)` | Yes | No | No | `` |  |
| 5 | `Ime` | `nvarchar(80)` | Yes | No | No | `` |  |
| 6 | `Kljuc` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Nakazilo` | `nvarchar(15)` | Yes | No | No | `` |  |
| 8 | `NamenNakazila1ZaNakupDeviz` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `NamenNakazila1ZaProvizijo` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `NamenNakazila2ZaNakupDeviz` | `nvarchar(50)` | Yes | No | No | `` |  |
| 11 | `NamenNakazila2ZaProvizijo` | `nvarchar(50)` | Yes | No | No | `` |  |
| 12 | `OBC` | `nvarchar(30)` | Yes | No | No | `` |  |
| 13 | `OznakaZBS` | `nvarchar(5)` | Yes | No | No | `` |  |
| 14 | `Provizija` | `float` | Yes | No | No | `` |  |
| 15 | `ProvizijaVProcentih` | `float` | Yes | No | No | `` |  |
| 16 | `ProvizijaVSIT` | `float` | Yes | No | No | `` |  |
| 17 | `RecNo` | `int` | No | Yes | No | `` |  |
| 18 | `Referent` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `Sifra1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 20 | `Sifra1ZaNakupDeviz` | `nvarchar(5)` | Yes | No | No | `` |  |
| 21 | `Sifra1ZaProvizijo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 22 | `Sifra2` | `nvarchar(5)` | Yes | No | No | `` |  |
| 23 | `Sifra2ZaNakupDeviz` | `nvarchar(5)` | Yes | No | No | `` |  |
| 24 | `Sifra2ZaProvizijo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 25 | `Sifra3` | `nvarchar(5)` | Yes | No | No | `` |  |
| 26 | `Sifra3ZaNakupDeviz` | `nvarchar(5)` | Yes | No | No | `` |  |
| 27 | `Sifra3ZaProvizijo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 28 | `SifraBanke` | `nvarchar(50)` | Yes | No | No | `` |  |
| 29 | `SklicObremenitve1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 30 | `SklicObremenitve1ZaNakupDeviz` | `nvarchar(5)` | Yes | No | No | `` |  |
| 31 | `SklicObremenitve1ZaProvizijo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 32 | `SklicObremenitve2` | `nvarchar(20)` | Yes | No | No | `` |  |
| 33 | `SklicObremenitve2ZaNakupDeviz` | `nvarchar(20)` | Yes | No | No | `` |  |
| 34 | `SklicObremenitve2ZaProvizijo` | `nvarchar(20)` | Yes | No | No | `` |  |
| 35 | `SklicOdobritve1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 36 | `SklicOdobritve1ZaNakupDeviz` | `nvarchar(5)` | Yes | No | No | `` |  |
| 37 | `SklicOdobritve1ZaProvizijo` | `nvarchar(5)` | Yes | No | No | `` |  |
| 38 | `SklicOdobritve2` | `nvarchar(20)` | Yes | No | No | `` |  |
| 39 | `SklicOdobritve2ZaNakupDeviz` | `nvarchar(20)` | Yes | No | No | `` |  |
| 40 | `SklicOdobritve2ZaProvizijo` | `nvarchar(20)` | Yes | No | No | `` |  |
| 41 | `SteviloIzvodov` | `smallint` | Yes | No | No | `` |  |
| 42 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 43 | `ZR` | `nvarchar(60)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Banka` | Yes | NONCLUSTERED | 1 | `ZR` | No |
| `ImeBanke` | No | NONCLUSTERED | 1 | `Ime` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
