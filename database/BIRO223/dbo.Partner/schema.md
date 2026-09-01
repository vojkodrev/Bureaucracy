# `dbo`.`Partner`

_No table description is defined in MSSQL._

- Rows: 1144
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `AlternativnaImena` | `ntext` | Yes | No | No | `` |  |
| 2 | `Cena1` | `float` | Yes | No | No | `` |  |
| 3 | `Cena2` | `float` | Yes | No | No | `` |  |
| 4 | `Cena3` | `float` | Yes | No | No | `` |  |
| 5 | `Cena4` | `float` | Yes | No | No | `` |  |
| 6 | `DatumKonca` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumNastopa` | `datetime` | Yes | No | No | `` |  |
| 8 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 9 | `DavcnaIzpostava` | `nvarchar(5)` | Yes | No | No | `` |  |
| 10 | `DavcnaStevilka` | `nvarchar(20)` | Yes | No | No | `` |  |
| 11 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 12 | `DelovnaDoba` | `decimal(12,6)` | Yes | No | No | `` |  |
| 13 | `DelovnoDovoljenjeST` | `nvarchar(30)` | Yes | No | No | `` |  |
| 14 | `DelovnoMesto` | `nvarchar(25)` | Yes | No | No | `` |  |
| 15 | `Detacirani` | `bit` | Yes | No | No | `` |  |
| 16 | `Dodatek1` | `float` | Yes | No | No | `` |  |
| 17 | `Dodatek2` | `float` | Yes | No | No | `` |  |
| 18 | `Dodatek3` | `float` | Yes | No | No | `` |  |
| 19 | `Dodatek4` | `float` | Yes | No | No | `` |  |
| 20 | `Dopust` | `decimal(12,6)` | Yes | No | No | `` |  |
| 21 | `DovoljenjeIzdanoDne` | `datetime` | Yes | No | No | `` |  |
| 22 | `DovoljenjeVeljaDO` | `datetime` | Yes | No | No | `` |  |
| 23 | `DovoljenjeVeljaOD` | `datetime` | Yes | No | No | `` |  |
| 24 | `DrugiDelodajalec` | `smallint` | Yes | No | No | `` |  |
| 25 | `Drzava` | `nvarchar(3)` | Yes | No | No | `` |  |
| 26 | `DrzavaDetasirani` | `nvarchar(3)` | Yes | No | No | `` |  |
| 27 | `DrzavaRezidenstva` | `nvarchar(3)` | Yes | No | No | `` |  |
| 28 | `Drzavljanstvo` | `nvarchar(30)` | Yes | No | No | `` |  |
| 29 | `DvigniCenoZaRabat` | `smallint` | Yes | No | No | `` |  |
| 30 | `Email` | `nvarchar(50)` | Yes | No | No | `` |  |
| 31 | `EMSO` | `nvarchar(32)` | Yes | No | No | `` |  |
| 32 | `Fax` | `nvarchar(60)` | Yes | No | No | `` |  |
| 33 | `HitraOpomba` | `ntext` | Yes | No | No | `` |  |
| 34 | `IDStevilka` | `nvarchar(22)` | Yes | No | No | `` |  |
| 35 | `IME` | `nvarchar(50)` | Yes | No | No | `` |  |
| 36 | `InternetDa` | `bit` | Yes | No | No | `` |  |
| 37 | `Invalid` | `bit` | Yes | No | No | `` |  |
| 38 | `IzkorisceniDopust` | `decimal(12,6)` | Yes | No | No | `` |  |
| 39 | `Komercialist` | `nvarchar(4)` | Yes | No | No | `` |  |
| 40 | `KonkurencnaKlavzula` | `decimal(12,6)` | Yes | No | No | `` |  |
| 41 | `Konsignatar` | `smallint` | Yes | No | No | `` |  |
| 42 | `Kontakt` | `nvarchar(60)` | Yes | No | No | `` |  |
| 43 | `Kraj` | `nvarchar(50)` | Yes | No | No | `` |  |
| 44 | `KrajZacasnegaBivalisca` | `nvarchar(50)` | Yes | No | No | `` |  |
| 45 | `LetnaNarocilnica` | `nvarchar(100)` | Yes | No | No | `` |  |
| 46 | `MaticnaStevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 47 | `Mesto` | `nvarchar(32)` | Yes | No | No | `` |  |
| 48 | `NacinProdaje` | `smallint` | Yes | No | No | `` |  |
| 49 | `Nerezident` | `bit` | Yes | No | No | `` |  |
| 50 | `NeUporabljaj` | `smallint` | Yes | No | No | `` |  |
| 51 | `NeUpostevajZaIOP` | `smallint` | Yes | No | No | `` |  |
| 52 | `ObcinaBivanja` | `nvarchar(5)` | Yes | No | No | `` |  |
| 53 | `Obrazec` | `nvarchar(1)` | Yes | No | No | `` |  |
| 54 | `OdjavljenIzZZZS` | `datetime` | Yes | No | No | `` |  |
| 55 | `OdprtPri` | `nvarchar(80)` | Yes | No | No | `` |  |
| 56 | `OmejitevNeplacano` | `float` | Yes | No | No | `` |  |
| 57 | `OmejitevZapadlo` | `float` | Yes | No | No | `` |  |
| 58 | `OmogociPlaciloZDobavnico` | `smallint` | Yes | No | No | `` |  |
| 59 | `Opombe` | `ntext` | Yes | No | No | `` |  |
| 60 | `OpozoriloZaRacun` | `ntext` | Yes | No | No | `` |  |
| 61 | `OsebnaIzkaznica` | `nvarchar(50)` | Yes | No | No | `` |  |
| 62 | `Otroci` | `float` | Yes | No | No | `` |  |
| 63 | `OZNAKA` | `nvarchar(10)` | Yes | No | No | `` |  |
| 64 | `Partner` | `nvarchar(52)` | Yes | No | No | `` |  |
| 65 | `Partner1` | `nvarchar(80)` | Yes | No | No | `` |  |
| 66 | `PlacilniRok` | `smallint` | Yes | No | No | `` |  |
| 67 | `Poklic` | `nvarchar(30)` | Yes | No | No | `` |  |
| 68 | `Posta` | `nvarchar(10)` | Yes | No | No | `` |  |
| 69 | `PostaZacasnegaBivalisca` | `nvarchar(10)` | Yes | No | No | `` |  |
| 70 | `PotniList` | `nvarchar(50)` | Yes | No | No | `` |  |
| 71 | `PotniListDo` | `datetime` | Yes | No | No | `` |  |
| 72 | `PotniListOd` | `datetime` | Yes | No | No | `` |  |
| 73 | `PreostaliDopust` | `decimal(12,6)` | Yes | No | No | `` |  |
| 74 | `PrijavljenNaZZZS` | `datetime` | Yes | No | No | `` |  |
| 75 | `RabatGeneralno` | `float` | Yes | No | No | `` |  |
| 76 | `RabatnaSkupina` | `smallint` | Yes | No | No | `` |  |
| 77 | `RecNo` | `int` | No | Yes | No | `` |  |
| 78 | `Rojen` | `datetime` | Yes | No | No | `` |  |
| 79 | `RojenVKraju` | `nvarchar(25)` | Yes | No | No | `` |  |
| 80 | `Sifra` | `nvarchar(10)` | Yes | No | No | `` |  |
| 81 | `SKIS` | `nvarchar(6)` | Yes | No | No | `` |  |
| 82 | `Sklic` | `nvarchar(32)` | Yes | No | No | `` |  |
| 83 | `Skupina` | `nvarchar(25)` | Yes | No | No | `` |  |
| 84 | `Sprememba` | `bit` | Yes | No | No | `` |  |
| 85 | `Stalnost` | `decimal(12,6)` | Yes | No | No | `` |  |
| 86 | `StalnostTrenutno` | `decimal(12,6)` | Yes | No | No | `` |  |
| 87 | `StevilkaRacuna` | `smallint` | Yes | No | No | `` |  |
| 88 | `Stimulac` | `float` | Yes | No | No | `` |  |
| 89 | `StopnjaIzobrazbe` | `nvarchar(40)` | Yes | No | No | `` |  |
| 90 | `SuperRabat` | `decimal(12,6)` | Yes | No | No | `` |  |
| 91 | `Telefon` | `nvarchar(60)` | Yes | No | No | `` |  |
| 92 | `TempCena1` | `float` | Yes | No | No | `` |  |
| 93 | `TempCena2` | `float` | Yes | No | No | `` |  |
| 94 | `TempCena3` | `float` | Yes | No | No | `` |  |
| 95 | `TezavnostDela` | `smallint` | Yes | No | No | `` |  |
| 96 | `TKDIS` | `ntext` | Yes | No | No | `` |  |
| 97 | `Ulica` | `nvarchar(32)` | Yes | No | No | `` |  |
| 98 | `VarnostPriDelu` | `datetime` | Yes | No | No | `` |  |
| 99 | `VarnostPriDeluVeljaDO` | `datetime` | Yes | No | No | `` |  |
| 100 | `VarnostPriDeluVeljaOD` | `datetime` | Yes | No | No | `` |  |
| 101 | `Viza` | `nvarchar(50)` | Yes | No | No | `` |  |
| 102 | `VizaDO` | `datetime` | Yes | No | No | `` |  |
| 103 | `VizaOD` | `datetime` | Yes | No | No | `` |  |
| 104 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 105 | `Vrsta` | `nvarchar(32)` | Yes | No | No | `` |  |
| 106 | `VrstaHonorarja` | `nvarchar(2)` | Yes | No | No | `` |  |
| 107 | `VrstaIzplacila` | `smallint` | Yes | No | No | `` |  |
| 108 | `VrstaOsebe` | `smallint` | Yes | No | No | `` |  |
| 109 | `VrstaUre` | `nvarchar(50)` | Yes | No | No | `` |  |
| 110 | `VrstaZaposlitve` | `nvarchar(50)` | Yes | No | No | `` |  |
| 111 | `VzdrzevaniOdrasli` | `smallint` | Yes | No | No | `` |  |
| 112 | `ZacasnoBivalisce` | `nvarchar(32)` | Yes | No | No | `` |  |
| 113 | `Zaposlen` | `smallint` | Yes | No | No | `` |  |
| 114 | `ZdravstveniPregled` | `datetime` | Yes | No | No | `` |  |
| 115 | `ZdravstveniPregledVeljaDO` | `datetime` | Yes | No | No | `` |  |
| 116 | `ZdravstveniPregledVeljaOD` | `datetime` | Yes | No | No | `` |  |
| 117 | `Ziro_Racun` | `nvarchar(60)` | Yes | No | No | `` |  |
| 118 | `Ziro_Racun1` | `nvarchar(60)` | Yes | No | No | `` |  |
| 119 | `Ziro_Racun2` | `nvarchar(60)` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `DavcnaStevilka` | No | NONCLUSTERED | 1 | `DavcnaStevilka` | No |
| `IDStevilka` | No | NONCLUSTERED | 1 | `IDStevilka` | No |
| `Partner` | No | NONCLUSTERED | 1 | `Partner` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Sifra` | Yes | NONCLUSTERED | 1 | `Sifra` | No |
| `Ucitelj` | No | NONCLUSTERED | 1 | `OZNAKA` | No |

## Check constraints

_None._
