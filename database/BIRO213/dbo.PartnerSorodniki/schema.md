# `dbo`.`PartnerSorodniki`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `EMSO` | `nvarchar(30)` | Yes | No | No | `` |  |
| 3 | `ImeInPriimek` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `Oznaka` | `nvarchar(3)` | Yes | No | No | `` |  |
| 5 | `Razmerje` | `nvarchar(20)` | Yes | No | No | `` |  |
| 6 | `RecNo` | `int` | No | Yes | No | `` |  |
| 7 | `VDCDavcnaStevilka` | `nvarchar(8)` | Yes | No | No | `` |  |
| 8 | `VDCDoMeseca` | `nvarchar(2)` | Yes | No | No | `` |  |
| 9 | `VDCOdMeseca` | `nvarchar(2)` | Yes | No | No | `` |  |
| 10 | `VDCOznaka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 11 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
