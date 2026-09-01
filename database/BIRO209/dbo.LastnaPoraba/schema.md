# `dbo`.`LastnaPoraba`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumZaObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 5 | `GK` | `smallint` | Yes | No | No | `` |  |
| 6 | `GotovinskaPlacila` | `float` | Yes | No | No | `` |  |
| 7 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 8 | `Izravnava` | `float` | Yes | No | No | `` |  |
| 9 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `NadaljnaProdaja` | `smallint` | Yes | No | No | `` |  |
| 11 | `NegotovinskaPlacila` | `float` | Yes | No | No | `` |  |
| 12 | `ObracunDavka` | `datetime` | Yes | No | No | `` |  |
| 13 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `PopustBrezPD` | `float` | Yes | No | No | `` |  |
| 15 | `PopustPD` | `float` | Yes | No | No | `` |  |
| 16 | `Prodajalec` | `ntext` | Yes | No | No | `` |  |
| 17 | `Rabat` | `float` | Yes | No | No | `` |  |
| 18 | `RabatnaSkupina` | `nvarchar(1)` | Yes | No | No | `` |  |
| 19 | `RecNo` | `int` | No | Yes | No | `` |  |
| 20 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `Skladisce` | `nvarchar(2)` | Yes | No | No | `` |  |
| 22 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 23 | `StevilkaObracunaDavka` | `smallint` | Yes | No | No | `` |  |
| 24 | `StevilkaPOS` | `nvarchar(10)` | Yes | No | No | `` |  |
| 25 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 26 | `Ura` | `smallint` | Yes | No | No | `` |  |
| 27 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 28 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 29 | `VrstaPorabe` | `smallint` | Yes | No | No | `` |  |
| 30 | `Znesek` | `float` | Yes | No | No | `` |  |
| 31 | `ZnesekBlaga` | `float` | Yes | No | No | `` |  |
| 32 | `ZnesekBlagaPD` | `float` | Yes | No | No | `` |  |
| 33 | `ZRDavek` | `nvarchar(30)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
