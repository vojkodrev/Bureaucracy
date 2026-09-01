# `dbo`.`Artikel`

_No table description is defined in MSSQL._

- Rows: 1033
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `AlternativniOpis` | `ntext` | Yes | No | No | `` |  |
| 2 | `AlternativniOpis1` | `ntext` | Yes | No | No | `` |  |
| 3 | `AlternativniOpis2` | `ntext` | Yes | No | No | `` |  |
| 4 | `AlternativniOpis3` | `ntext` | Yes | No | No | `` |  |
| 5 | `Artikel` | `nvarchar(25)` | Yes | No | No | `` |  |
| 6 | `BarKoda` | `nvarchar(50)` | Yes | No | No | `` |  |
| 7 | `Cena1` | `float` | Yes | No | No | `` |  |
| 8 | `Cena2` | `float` | Yes | No | No | `` |  |
| 9 | `Cena3` | `float` | Yes | No | No | `` |  |
| 10 | `CenaBrezDavka` | `float` | Yes | No | No | `` |  |
| 11 | `CenaVValuti` | `float` | Yes | No | No | `` |  |
| 12 | `CenaZDavkom` | `float` | Yes | No | No | `` |  |
| 13 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 14 | `Davek` | `decimal(12,6)` | Yes | No | No | `` |  |
| 15 | `Drzava1` | `nvarchar(3)` | Yes | No | No | `` |  |
| 16 | `Drzava2` | `nvarchar(3)` | Yes | No | No | `` |  |
| 17 | `Drzava3` | `nvarchar(3)` | Yes | No | No | `` |  |
| 18 | `DrzavaPorekla` | `nvarchar(3)` | Yes | No | No | `` |  |
| 19 | `Enota` | `nvarchar(10)` | Yes | No | No | `` |  |
| 20 | `Enota1` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `Enota2` | `nvarchar(10)` | Yes | No | No | `` |  |
| 22 | `Enota3` | `nvarchar(10)` | Yes | No | No | `` |  |
| 23 | `HitroNarocanje` | `smallint` | Yes | No | No | `` |  |
| 24 | `Hotelir` | `smallint` | Yes | No | No | `` |  |
| 25 | `ImaNormativ` | `nvarchar(2)` | Yes | No | No | `` |  |
| 26 | `ImaSestavo` | `nvarchar(2)` | Yes | No | No | `` |  |
| 27 | `ImeSlike` | `ntext` | Yes | No | No | `` |  |
| 28 | `InternetDa` | `bit` | Yes | No | No | `` |  |
| 29 | `IzpisNarocila` | `smallint` | Yes | No | No | `` |  |
| 30 | `IzpisNarocila2` | `smallint` | Yes | No | No | `` |  |
| 31 | `JeMeni` | `smallint` | Yes | No | No | `` |  |
| 32 | `KomentarSlike` | `ntext` | Yes | No | No | `` |  |
| 33 | `LastniProizvod` | `smallint` | Yes | No | No | `` |  |
| 34 | `NeDovoliPopusta` | `smallint` | Yes | No | No | `` |  |
| 35 | `NeUporabljaj` | `smallint` | Yes | No | No | `` |  |
| 36 | `Opis` | `nvarchar(100)` | Yes | No | No | `` |  |
| 37 | `Opis1` | `nvarchar(100)` | Yes | No | No | `` |  |
| 38 | `Opis2` | `nvarchar(100)` | Yes | No | No | `` |  |
| 39 | `Opis3` | `nvarchar(100)` | Yes | No | No | `` |  |
| 40 | `OpisDavka` | `nvarchar(30)` | Yes | No | No | `` |  |
| 41 | `PodVrsta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 42 | `POS` | `smallint` | Yes | No | No | `` |  |
| 43 | `PripraviZaBarKodo` | `smallint` | Yes | No | No | `` |  |
| 44 | `PrometVZ` | `smallint` | Yes | No | No | `` |  |
| 45 | `Rabat1` | `float` | Yes | No | No | `` |  |
| 46 | `Rabat2` | `float` | Yes | No | No | `` |  |
| 47 | `Rabat3` | `float` | Yes | No | No | `` |  |
| 48 | `Rabat4` | `float` | Yes | No | No | `` |  |
| 49 | `Rabat5` | `float` | Yes | No | No | `` |  |
| 50 | `Rabat6` | `float` | Yes | No | No | `` |  |
| 51 | `Rabat7` | `float` | Yes | No | No | `` |  |
| 52 | `Rabat8` | `float` | Yes | No | No | `` |  |
| 53 | `RecNo` | `int` | No | Yes | No | `` |  |
| 54 | `RokDobave` | `smallint` | Yes | No | No | `` |  |
| 55 | `SamoDavekOdZasluzka` | `smallint` | Yes | No | No | `` |  |
| 56 | `SifraDavka` | `nvarchar(2)` | Yes | No | No | `` |  |
| 57 | `Skupina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 58 | `Sprememba` | `bit` | Yes | No | No | `` |  |
| 59 | `Status` | `nvarchar(1)` | Yes | No | No | `` |  |
| 60 | `Tarifa` | `nvarchar(10)` | Yes | No | No | `` |  |
| 61 | `Teza` | `nvarchar(10)` | Yes | No | No | `` |  |
| 62 | `TezaNaEnoto` | `float` | Yes | No | No | `` |  |
| 63 | `TiskajSestavo` | `smallint` | Yes | No | No | `` |  |
| 64 | `Valuta` | `nvarchar(3)` | Yes | No | No | `` |  |
| 65 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 66 | `Vrsta` | `nvarchar(50)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Artikel` | Yes | NONCLUSTERED | 1 | `Artikel` | No |
| `Artikel1` | No | NONCLUSTERED | 1 | `Vrsta` | No |
| `Artikel2` | No | NONCLUSTERED | 1 | `Opis` | No |
| `Artikel2` | No | NONCLUSTERED | 2 | `Artikel` | No |
| `Artikel2` | No | NONCLUSTERED | 3 | `BarKoda` | No |
| `Artikel2` | No | NONCLUSTERED | 4 | `CenaZDavkom` | No |
| `Artikel2` | No | NONCLUSTERED | 5 | `NeUporabljaj` | No |
| `Artikel3` | No | NONCLUSTERED | 1 | `CenaBrezDavka` | No |
| `BarKoda` | No | NONCLUSTERED | 1 | `BarKoda` | No |
| `Opis` | No | NONCLUSTERED | 1 | `Opis` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
