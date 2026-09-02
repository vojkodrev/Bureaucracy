# `dbo`.`SifreOperaterjev`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `BrezNabavnihCen` | `smallint` | Yes | No | No | `` |  |
| 3 | `Dostop` | `ntext` | Yes | No | No | `` |  |
| 4 | `DostopVpis` | `ntext` | Yes | No | No | `` |  |
| 5 | `Geslo` | `nvarchar(20)` | Yes | No | No | `` |  |
| 6 | `ImeZaposlenega` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `No` | `nvarchar(50)` | Yes | No | No | `` |  |
| 8 | `No1` | `smallint` | Yes | No | No | `` |  |
| 9 | `Oddelek` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `OmogociAnalize` | `smallint` | Yes | No | No | `` |  |
| 11 | `OmogociToolbar` | `smallint` | Yes | No | No | `` |  |
| 12 | `OmogociVnosPartnerjev` | `smallint` | Yes | No | No | `` |  |
| 13 | `OmogociVnosProdajnihCen` | `smallint` | Yes | No | No | `` |  |
| 14 | `OnemogociIzpisSifrantov` | `smallint` | Yes | No | No | `` |  |
| 15 | `OnemogociKadre` | `smallint` | Yes | No | No | `` |  |
| 16 | `OnemogociPE` | `smallint` | Yes | No | No | `` |  |
| 17 | `OnemogociVnosPartnerjev` | `smallint` | Yes | No | No | `` |  |
| 18 | `OnemogociVnosProdajnihCen` | `smallint` | Yes | No | No | `` |  |
| 19 | `OnemogociVnosSifrantov` | `smallint` | Yes | No | No | `` |  |
| 20 | `OnemogociVnosVrst` | `smallint` | Yes | No | No | `` |  |
| 21 | `Operater` | `nvarchar(50)` | Yes | No | No | `` |  |
| 22 | `Opis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 23 | `Oznaka` | `nvarchar(3)` | Yes | No | No | `` |  |
| 24 | `OznakaLeta` | `nvarchar(2)` | Yes | No | No | `` |  |
| 25 | `PCName` | `nvarchar(50)` | Yes | No | No | `` |  |
| 27 | `SamoTekoce` | `smallint` | Yes | No | No | `` |  |
| 28 | `SkupinaArtiklov` | `smallint` | Yes | No | No | `` |  |
| 29 | `SpremembaPodatkov` | `smallint` | Yes | No | No | `` |  |
| 30 | `Toolbar` | `ntext` | Yes | No | No | `` |  |
| 31 | `Vnasalec` | `nvarchar(10)` | Yes | No | No | `` |  |
| 32 | `Zaposleni` | `nvarchar(3)` | Yes | No | No | `` |  |
| 33 | `DatumVnosa` | `nvarchar(10)` | Yes | No | No | `` |  |
| 34 | `RecNo` | `int` | No | Yes | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Operater` | No | NONCLUSTERED | 1 | `Operater` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
