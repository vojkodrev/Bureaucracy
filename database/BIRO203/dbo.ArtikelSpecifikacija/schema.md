# `dbo`.`ArtikelSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 124
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Aktivno` | `smallint` | Yes | No | No | `` |  |
| 2 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 3 | `ArtikelVZalogi` | `nvarchar(25)` | Yes | No | No | `` |  |
| 4 | `DatumVeljavnosti` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 6 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 7 | `RecNo` | `int` | No | Yes | No | `` |  |
| 8 | `UdelezbaVCeni` | `float` | Yes | No | No | `` |  |
| 9 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `ArtikelNaDatum` | Yes | NONCLUSTERED | 1 | `ArtikelVZalogi` | No |
| `ArtikelNaDatum` | Yes | NONCLUSTERED | 2 | `Artikel` | No |
| `ArtikelNaDatum` | Yes | NONCLUSTERED | 3 | `DatumVeljavnosti` | No |
| `ArtikelVZalogi` | No | NONCLUSTERED | 1 | `ArtikelVZalogi` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
