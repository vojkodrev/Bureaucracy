# `dbo`.`VDDobavitelji`

_No table description is defined in MSSQL._

- Rows: 39
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Davek` | `float` | Yes | No | No | `` |  |
| 3 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 4 | `FORMULAR` | `nvarchar(1)` | Yes | No | No | `` |  |
| 5 | `IME` | `nvarchar(35)` | Yes | No | No | `` |  |
| 6 | `InfoKonto` | `nvarchar(10)` | Yes | No | No | `` |  |
| 7 | `Nepremicnina` | `smallint` | Yes | No | No | `` |  |
| 8 | `NeUpostevajOdbitniDelez` | `smallint` | Yes | No | No | `` |  |
| 9 | `OdbijDDV` | `smallint` | Yes | No | No | `` |  |
| 10 | `Opisdavka` | `nvarchar(25)` | Yes | No | No | `` |  |
| 11 | `OsnovnoSredstvo` | `smallint` | Yes | No | No | `` |  |
| 12 | `RecNo` | `int` | No | Yes | No | `` |  |
| 13 | `SIFRA` | `nvarchar(5)` | Yes | No | No | `` |  |
| 14 | `Sifra1` | `nvarchar(6)` | Yes | No | No | `` |  |
| 15 | `Sifra2` | `nvarchar(4)` | Yes | No | No | `` |  |
| 16 | `Sifra3` | `nvarchar(5)` | Yes | No | No | `` |  |
| 17 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 18 | `SifraOsnoveTujina` | `nvarchar(5)` | Yes | No | No | `` |  |
| 19 | `SIFRE` | `nvarchar(8)` | Yes | No | No | `` |  |
| 20 | `SKLIC1` | `nvarchar(30)` | Yes | No | No | `` |  |
| 21 | `SKLIC2` | `nvarchar(30)` | Yes | No | No | `` |  |
| 22 | `StevilkaKreditaTujina` | `nvarchar(10)` | Yes | No | No | `` |  |
| 23 | `TextDDV` | `nvarchar(2)` | Yes | No | No | `` |  |
| 24 | `UvozniDDV` | `smallint` | Yes | No | No | `` |  |
| 25 | `VELJA` | `nvarchar(2)` | Yes | No | No | `` |  |
| 26 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 27 | `VRSTA` | `nvarchar(8)` | Yes | No | No | `` |  |
| 28 | `VrstaVD` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `ImeVD` | No | NONCLUSTERED | 1 | `IME` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `VD` | Yes | NONCLUSTERED | 1 | `SIFRA` | No |

## Check constraints

_None._
