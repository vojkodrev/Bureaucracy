# `dbo`.`PartnerRabati`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Podvrsta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 2 | `Rabat` | `float` | Yes | No | No | `` |  |
| 3 | `RecNo` | `int` | No | Yes | No | `` |  |
| 4 | `SifraPartnerja` | `nvarchar(15)` | Yes | No | No | `` |  |
| 5 | `Sprememba` | `bit` | Yes | No | No | `` |  |
| 6 | `Vrsta` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Partner` | Yes | NONCLUSTERED | 1 | `SifraPartnerja` | No |
| `Partner` | Yes | NONCLUSTERED | 2 | `Vrsta` | No |
| `Partner` | Yes | NONCLUSTERED | 3 | `Podvrsta` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
