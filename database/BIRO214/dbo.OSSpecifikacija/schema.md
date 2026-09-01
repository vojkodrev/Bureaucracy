# `dbo`.`OSSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Amortizacija` | `float` | Yes | No | No | `` |  |
| 2 | `DatumObracuna` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumRevalorizacije` | `datetime` | Yes | No | No | `` |  |
| 4 | `GK` | `smallint` | Yes | No | No | `` |  |
| 5 | `RecNo` | `int` | No | Yes | No | `` |  |
| 6 | `RevalorizacijaAmortizacije` | `float` | Yes | No | No | `` |  |
| 7 | `RevalorizacijaNabavneVrednosti` | `float` | Yes | No | No | `` |  |
| 8 | `RevalorizacijaPopravkaVrednostiObracunanegaMedLetom` | `float` | Yes | No | No | `` |  |
| 9 | `RevalorizacijskiUcinek` | `float` | Yes | No | No | `` |  |
| 10 | `SedanjaVrednost` | `float` | Yes | No | No | `` |  |
| 11 | `SkupniPopravekVrednosti` | `float` | Yes | No | No | `` |  |
| 12 | `Stevilka` | `int` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
