# `dbo`.`PartnerKontakt`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `email` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `Komentar` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `Kontakt` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `Kraj` | `nvarchar(50)` | Yes | No | No | `` |  |
| 6 | `Naslov` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Partner` | `nvarchar(10)` | Yes | No | No | `` |  |
| 8 | `PosljiRacun` | `smallint` | Yes | No | No | `` |  |
| 9 | `Posta` | `nvarchar(10)` | Yes | No | No | `` |  |
| 10 | `PrivzetiKontakt` | `smallint` | Yes | No | No | `` |  |
| 11 | `RecNo` | `int` | No | Yes | No | `` |  |
| 12 | `Sifra` | `smallint` | Yes | No | No | `` |  |
| 13 | `Telefon` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Partner` | No | NONCLUSTERED | 1 | `Partner` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
