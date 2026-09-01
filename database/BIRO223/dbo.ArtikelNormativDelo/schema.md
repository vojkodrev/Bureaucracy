# `dbo`.`ArtikelNormativDelo`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 3 | `OpisDela` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `RecNo` | `int` | No | Yes | No | `` |  |
| 5 | `SifraDela` | `nvarchar(10)` | Yes | No | No | `` |  |
| 6 | `Zaposlen` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Artikel` | No | NONCLUSTERED | 2 | `SifraDela` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
