# `dbo`.`NarocilniceSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Kolicina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `ME` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `Odpremljeno` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `Predmet` | `nvarchar(150)` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `Sifra` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Stevilka` | `nvarchar(5)` | Yes | No | No | `` |  |
| 8 | `StevilkaNum` | `int` | Yes | No | No | `` |  |
| 9 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaNum` | No | NONCLUSTERED | 1 | `StevilkaNum` | No |

## Check constraints

_None._
