# `dbo`.`PostnaKnjiga`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumPotrditve` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 4 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 5 | `Komentar` | `nvarchar(255)` | Yes | No | No | `` |  |
| 6 | `Letalsko` | `smallint` | Yes | No | No | `` |  |
| 7 | `Nujno` | `smallint` | Yes | No | No | `` |  |
| 8 | `Odkupnina` | `float` | Yes | No | No | `` |  |
| 9 | `Postnina` | `float` | Yes | No | No | `` |  |
| 10 | `RecNo` | `int` | No | Yes | No | `` |  |
| 11 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `Sporocilo` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `Teza` | `float` | Yes | No | No | `` |  |
| 14 | `Tip` | `nvarchar(10)` | Yes | No | No | `` |  |
| 15 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 16 | `VrednostPoste` | `float` | Yes | No | No | `` |  |
| 17 | `VrstaPoste` | `nvarchar(40)` | Yes | No | No | `` |  |
| 18 | `Zadeva` | `nvarchar(150)` | Yes | No | No | `` |  |
| 19 | `Zaposlen` | `nvarchar(50)` | Yes | No | No | `` |  |
| 20 | `ZapSt` | `smallint` | Yes | No | No | `` |  |

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
