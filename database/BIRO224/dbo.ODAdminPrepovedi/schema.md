# `dbo`.`ODAdminPrepovedi`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 3 | `ImePrejemnika` | `nvarchar(32)` | Yes | No | No | `` |  |
| 4 | `Imezaposlenega` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `OpisOdbitka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `Oznaka` | `nvarchar(6)` | Yes | No | No | `` |  |
| 7 | `PlacanihObrokov` | `smallint` | Yes | No | No | `` |  |
| 8 | `ProcentOdbitkaOdBruto` | `float` | Yes | No | No | `` |  |
| 9 | `ProcentOdbitkaOdNeto` | `float` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `Sifra1` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `SIfra2` | `nvarchar(2)` | Yes | No | No | `` |  |
| 13 | `Sifra3` | `nvarchar(2)` | Yes | No | No | `` |  |
| 14 | `SifraPrejemnika` | `nvarchar(6)` | Yes | No | No | `` |  |
| 15 | `SklicObremenitve1` | `nvarchar(2)` | Yes | No | No | `` |  |
| 16 | `SklicObremenitve2` | `nvarchar(50)` | Yes | No | No | `` |  |
| 17 | `SklicOdobritve1` | `nvarchar(2)` | Yes | No | No | `` |  |
| 18 | `SklicOdobritve2` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `SteviloObrokov` | `smallint` | Yes | No | No | `` |  |
| 20 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 21 | `ZiroRacun` | `nvarchar(50)` | Yes | No | No | `` |  |
| 22 | `ZnesekOdbitka` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Prepoved` | Yes | NONCLUSTERED | 1 | `Oznaka` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
