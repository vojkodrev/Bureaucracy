# `dbo`.`ODPokojnina`

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
| 5 | `Oznaka` | `nvarchar(6)` | Yes | No | No | `` |  |
| 6 | `ProcentOdBruto` | `float` | Yes | No | No | `` |  |
| 7 | `ProcentOdNeto` | `float` | Yes | No | No | `` |  |
| 8 | `RecNo` | `int` | No | Yes | No | `` |  |
| 9 | `Sifra1` | `nvarchar(2)` | Yes | No | No | `` |  |
| 10 | `SIfra2` | `nvarchar(2)` | Yes | No | No | `` |  |
| 11 | `Sifra3` | `nvarchar(2)` | Yes | No | No | `` |  |
| 12 | `SifraPrejemnika` | `nvarchar(10)` | Yes | No | No | `` |  |
| 13 | `SklicObremenitve1` | `nvarchar(2)` | Yes | No | No | `` |  |
| 14 | `SklicObremenitve2` | `nvarchar(20)` | Yes | No | No | `` |  |
| 15 | `SklicOdobritve1` | `nvarchar(2)` | Yes | No | No | `` |  |
| 16 | `SklicOdobritve2` | `nvarchar(20)` | Yes | No | No | `` |  |
| 17 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 18 | `ZiroRacun` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `ZnesekPrispevka` | `float` | Yes | No | No | `` |  |

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
