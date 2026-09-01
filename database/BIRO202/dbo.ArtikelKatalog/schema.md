# `dbo`.`ArtikelKatalog`

_No table description is defined in MSSQL._

- Rows: 13
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `AlternativniOpis` | `ntext` | Yes | No | No | `` |  |
| 2 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 3 | `BarKoda` | `nvarchar(25)` | Yes | No | No | `` |  |
| 4 | `CarinskaStopnja` | `float` | Yes | No | No | `` |  |
| 5 | `CenaBrezDavka` | `float` | Yes | No | No | `` |  |
| 6 | `CenaVValuti` | `float` | Yes | No | No | `` |  |
| 7 | `CenaZDavkom` | `float` | Yes | No | No | `` |  |
| 8 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 9 | `Davek` | `decimal(12,6)` | Yes | No | No | `` |  |
| 10 | `DrzavaPorekla` | `nvarchar(3)` | Yes | No | No | `` |  |
| 11 | `Enota` | `nvarchar(10)` | Yes | No | No | `` |  |
| 12 | `ImeSlike` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `Kakovost` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `KolicinaNaEM` | `float` | Yes | No | No | `` |  |
| 15 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 16 | `KomentarSlike` | `ntext` | Yes | No | No | `` |  |
| 17 | `LastniProizvod` | `smallint` | Yes | No | No | `` |  |
| 18 | `Lastnosti` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `MinimalnaZaloga` | `float` | Yes | No | No | `` |  |
| 20 | `Opis` | `nvarchar(100)` | Yes | No | No | `` |  |
| 21 | `OpisDavka` | `nvarchar(30)` | Yes | No | No | `` |  |
| 22 | `PodVrsta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 23 | `Prevod` | `nvarchar(50)` | Yes | No | No | `` |  |
| 24 | `Proizvajalec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 25 | `Rabat1` | `float` | Yes | No | No | `` |  |
| 26 | `Rabat2` | `float` | Yes | No | No | `` |  |
| 27 | `Rabat3` | `float` | Yes | No | No | `` |  |
| 28 | `Rabat4` | `float` | Yes | No | No | `` |  |
| 29 | `Rabat5` | `float` | Yes | No | No | `` |  |
| 30 | `Rabat6` | `float` | Yes | No | No | `` |  |
| 31 | `Rabat7` | `float` | Yes | No | No | `` |  |
| 32 | `Rabat8` | `float` | Yes | No | No | `` |  |
| 33 | `RecNo` | `int` | No | Yes | No | `` |  |
| 34 | `RokDobave` | `smallint` | Yes | No | No | `` |  |
| 35 | `SamoDavekOdZasluzka` | `smallint` | Yes | No | No | `` |  |
| 36 | `Sestava` | `nvarchar(50)` | Yes | No | No | `` |  |
| 37 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 38 | `Skupina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 39 | `Slika` | `nvarchar(50)` | Yes | No | No | `` |  |
| 40 | `SteviloNaPaket` | `float` | Yes | No | No | `` |  |
| 41 | `Tarifa` | `nvarchar(20)` | Yes | No | No | `` |  |
| 42 | `Teza` | `nvarchar(10)` | Yes | No | No | `` |  |
| 43 | `TezaNaEnoto` | `float` | Yes | No | No | `` |  |
| 44 | `TezaPolnega` | `float` | Yes | No | No | `` |  |
| 45 | `TezaPraznega` | `float` | Yes | No | No | `` |  |
| 46 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 47 | `Velikost` | `nvarchar(50)` | Yes | No | No | `` |  |
| 48 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 49 | `Volumen` | `float` | Yes | No | No | `` |  |
| 50 | `Vrsta` | `nvarchar(50)` | Yes | No | No | `` |  |

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
