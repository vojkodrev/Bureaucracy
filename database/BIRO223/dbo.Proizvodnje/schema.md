# `dbo`.`Proizvodnje`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `BrezZaloge` | `smallint` | Yes | No | No | `` |  |
| 2 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 3 | `DNSestavaObvezno` | `smallint` | Yes | No | No | `` |  |
| 4 | `DNsProdajnimiCenami` | `smallint` | Yes | No | No | `` |  |
| 5 | `Komentar` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `Opis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Oznaka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 8 | `OznakaZaGK` | `nvarchar(2)` | Yes | No | No | `` |  |
| 9 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 12 | `Vrsta` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Leta` | Yes | NONCLUSTERED | 1 | `Oznaka` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
