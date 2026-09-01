# `dbo`.`ArtikelNabava`

_No table description is defined in MSSQL._

- Rows: 126
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `AlternativniOpis` | `ntext` | Yes | No | No | `` |  |
| 2 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 3 | `BarKoda` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `BarkodaPriPrevzemu` | `smallint` | Yes | No | No | `` |  |
| 5 | `CarinskaStopnja` | `float` | Yes | No | No | `` |  |
| 6 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 7 | `DobaviteljevaSifra` | `nvarchar(25)` | Yes | No | No | `` |  |
| 8 | `DovoliNabavoBrezNormativa` | `smallint` | Yes | No | No | `` |  |
| 9 | `DrzavaPorekla` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `Enota` | `nvarchar(10)` | Yes | No | No | `` |  |
| 11 | `InfoNabavnaCena` | `float` | Yes | No | No | `` |  |
| 12 | `Kakovost` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `KolicinaNaEM` | `float` | Yes | No | No | `` |  |
| 14 | `Lastnosti` | `nvarchar(50)` | Yes | No | No | `` |  |
| 15 | `MinimalnaZaloga` | `float` | Yes | No | No | `` |  |
| 16 | `NeUporabljaj` | `smallint` | Yes | No | No | `` |  |
| 17 | `Opis` | `nvarchar(100)` | Yes | No | No | `` |  |
| 18 | `PodVrsta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `Prevod` | `nvarchar(50)` | Yes | No | No | `` |  |
| 20 | `Proizvajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 21 | `RecNo` | `int` | No | Yes | No | `` |  |
| 22 | `SerijskeStevilke` | `smallint` | Yes | No | No | `` |  |
| 23 | `Sestava` | `nvarchar(50)` | Yes | No | No | `` |  |
| 24 | `Skupina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 25 | `SteviloNaPaket` | `float` | Yes | No | No | `` |  |
| 26 | `Tarifa` | `nvarchar(10)` | Yes | No | No | `` |  |
| 27 | `TezaNaEnoto` | `float` | Yes | No | No | `` |  |
| 28 | `TezaPolnega` | `float` | Yes | No | No | `` |  |
| 29 | `TezaPraznega` | `float` | Yes | No | No | `` |  |
| 30 | `Velikost` | `nvarchar(50)` | Yes | No | No | `` |  |
| 31 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 32 | `Volumen` | `float` | Yes | No | No | `` |  |
| 33 | `Vrsta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 34 | `Zaloga` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | Yes | NONCLUSTERED | 1 | `Artikel` | No |
| `BarKoda` | No | NONCLUSTERED | 1 | `BarKoda` | No |
| `Opis` | No | NONCLUSTERED | 1 | `Opis` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
