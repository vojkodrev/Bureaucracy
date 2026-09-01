# `dbo`.`POSRacuniSpecifikacija`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `Cena` | `float` | Yes | No | No | `` |  |
| 3 | `Datum` | `datetime` | Yes | No | No | `` |  |
| 4 | `Deleted` | `smallint` | Yes | No | No | `` |  |
| 5 | `Dnevnik` | `smallint` | Yes | No | No | `` |  |
| 6 | `Enota` | `nvarchar(10)` | Yes | No | No | `` |  |
| 7 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 8 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 9 | `OnemogociPopust` | `smallint` | Yes | No | No | `` |  |
| 10 | `Opis` | `nvarchar(255)` | Yes | No | No | `` |  |
| 11 | `OtroskiPopust` | `float` | Yes | No | No | `` |  |
| 12 | `Popust` | `float` | Yes | No | No | `` |  |
| 13 | `Preneseno` | `smallint` | Yes | No | No | `` |  |
| 14 | `Prodajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `SamostojenIzpis` | `smallint` | Yes | No | No | `` |  |
| 17 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 18 | `SifraPaketa` | `nvarchar(10)` | Yes | No | No | `` |  |
| 19 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 20 | `SteviloOseb` | `smallint` | Yes | No | No | `` |  |
| 21 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | No | NONCLUSTERED | 1 | `Opis` | No |
| `Datum` | No | NONCLUSTERED | 1 | `Datum` | No |
| `Datum` | No | NONCLUSTERED | 2 | `Artikel` | No |
| `Nabava` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Nabava` | No | NONCLUSTERED | 2 | `Datum` | No |
| `Recno` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `SifraArtikla` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 1 | `Stevilka` | No |
| `StevilkaInArtikel` | No | NONCLUSTERED | 2 | `Artikel` | No |

## Check constraints

_None._
