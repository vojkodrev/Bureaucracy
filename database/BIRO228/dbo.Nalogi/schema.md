# `dbo`.`Nalogi`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 2 | `DatumDUR` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumIzdaje` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumIzvrsitve` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumOdobritve` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumPrevzema` | `datetime` | Yes | No | No | `` |  |
| 8 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 9 | `DatumZakljucka` | `datetime` | Yes | No | No | `` |  |
| 10 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 11 | `GK` | `smallint` | Yes | No | No | `` |  |
| 12 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 13 | `Izdal` | `nvarchar(3)` | Yes | No | No | `` |  |
| 14 | `Izvajal` | `nvarchar(3)` | Yes | No | No | `` |  |
| 15 | `KategorijaNapake` | `nvarchar(50)` | Yes | No | No | `` |  |
| 16 | `Kolicina` | `float` | Yes | No | No | `` |  |
| 17 | `KontaktnaOseba` | `nvarchar(50)` | Yes | No | No | `` |  |
| 18 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 19 | `OcenaStranke` | `nvarchar(50)` | Yes | No | No | `` |  |
| 20 | `Odobril` | `nvarchar(3)` | Yes | No | No | `` |  |
| 21 | `Opis` | `ntext` | Yes | No | No | `` |  |
| 22 | `OpisArtikla` | `nvarchar(100)` | Yes | No | No | `` |  |
| 23 | `OpisNapakePodpora` | `ntext` | Yes | No | No | `` |  |
| 24 | `OpombaStranke` | `ntext` | Yes | No | No | `` |  |
| 25 | `Opombe` | `ntext` | Yes | No | No | `` |  |
| 26 | `OpravljeneStoritve` | `ntext` | Yes | No | No | `` |  |
| 27 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 28 | `PorabljenMaterial` | `ntext` | Yes | No | No | `` |  |
| 29 | `PredlogaNalepk` | `nvarchar(50)` | Yes | No | No | `` |  |
| 30 | `PrenesenoVProdajo` | `smallint` | Yes | No | No | `` |  |
| 31 | `Prevzel` | `nvarchar(3)` | Yes | No | No | `` |  |
| 32 | `Prodajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 33 | `RecNo` | `int` | No | Yes | No | `` |  |
| 34 | `Reklamacija` | `smallint` | Yes | No | No | `` |  |
| 35 | `RokIzdelave` | `datetime` | Yes | No | No | `` |  |
| 36 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 37 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 38 | `StevilkaRacuna` | `nvarchar(6)` | Yes | No | No | `` |  |
| 39 | `StevilkaRacunaGotovi` | `nvarchar(6)` | Yes | No | No | `` |  |
| 40 | `StevilkaRacunaMP` | `nvarchar(6)` | Yes | No | No | `` |  |
| 41 | `SteviloUr` | `smallint` | Yes | No | No | `` |  |
| 42 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 43 | `Telefon` | `nvarchar(50)` | Yes | No | No | `` |  |
| 44 | `UraIzdaje` | `nvarchar(5)` | Yes | No | No | `` |  |
| 45 | `UraIzvrsitve` | `nvarchar(5)` | Yes | No | No | `` |  |
| 46 | `UraOdobritve` | `nvarchar(5)` | Yes | No | No | `` |  |
| 47 | `UraPrevzema` | `nvarchar(5)` | Yes | No | No | `` |  |
| 48 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 49 | `VrednostValute` | `float` | Yes | No | No | `` |  |
| 50 | `Znesek` | `float` | Yes | No | No | `` |  |
| 51 | `ZnesekDelo` | `float` | Yes | No | No | `` |  |
| 52 | `ZnesekMaterial` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | No | NONCLUSTERED | 1 | `Artikel` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
