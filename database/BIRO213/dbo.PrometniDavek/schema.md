# `dbo`.`PrometniDavek`

_No table description is defined in MSSQL._

- Rows: 10
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `DavekZBesedo` | `ntext` | Yes | No | No | `` |  |
| 3 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 6 | `List3M` | `smallint` | Yes | No | No | `` |  |
| 7 | `Opis` | `nvarchar(25)` | Yes | No | No | `` |  |
| 8 | `Procent` | `decimal(12,6)` | Yes | No | No | `` |  |
| 9 | `Razvrstitev` | `smallint` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `Sifra` | `nvarchar(2)` | Yes | No | No | `` |  |
| 12 | `Sifra1` | `nvarchar(4)` | Yes | No | No | `` |  |
| 13 | `Sifra2` | `nvarchar(4)` | Yes | No | No | `` |  |
| 14 | `Sifra3` | `nvarchar(4)` | Yes | No | No | `` |  |
| 15 | `SklicObremenitve1` | `nvarchar(5)` | Yes | No | No | `` |  |
| 16 | `SklicObremenitve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 17 | `SklicOdobritve1` | `nvarchar(4)` | Yes | No | No | `` |  |
| 18 | `SklicOdobritve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 19 | `StevilkaNaFormularju` | `smallint` | Yes | No | No | `` |  |
| 20 | `Storitev` | `nvarchar(2)` | Yes | No | No | `` |  |
| 21 | `TarifnaStevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 22 | `TextRazvrstitve` | `nvarchar(200)` | Yes | No | No | `` |  |
| 23 | `VDobroracuna` | `nvarchar(60)` | Yes | No | No | `` |  |
| 24 | `VdobroRacuna2` | `nvarchar(32)` | Yes | No | No | `` |  |
| 25 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 26 | `VrstaDavka` | `smallint` | Yes | No | No | `` |  |
| 27 | `VrsticaSpecifikacije3M` | `smallint` | Yes | No | No | `` |  |
| 28 | `VrsticaZbira3M` | `smallint` | Yes | No | No | `` |  |
| 29 | `ZiroRacun` | `nvarchar(30)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `SIfra` | Yes | NONCLUSTERED | 1 | `Sifra` | No |

## Check constraints

_None._
