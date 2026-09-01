# `dbo`.`OS`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `Amortizacija` | `float` | Yes | No | No | `` |  |
| 2 | `AmortizacijskaSkupina` | `nvarchar(50)` | Yes | No | No | `` |  |
| 3 | `DatumFakture` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumOdtujitve` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumPridobitve` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 7 | `DobaUporabe` | `float` | Yes | No | No | `` |  |
| 8 | `Dobavitelj` | `nvarchar(60)` | Yes | No | No | `` |  |
| 9 | `DosedanjiPopravekVrednosti` | `float` | Yes | No | No | `` |  |
| 10 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 11 | `LetnaStopnjaAmortizacije` | `float` | Yes | No | No | `` |  |
| 12 | `NabavnaVrednost` | `float` | Yes | No | No | `` |  |
| 13 | `Naziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 14 | `NiAmortizacije` | `smallint` | Yes | No | No | `` |  |
| 15 | `OpisFakture` | `nvarchar(50)` | Yes | No | No | `` |  |
| 16 | `Otvoritev` | `smallint` | Yes | No | No | `` |  |
| 17 | `Partner` | `nvarchar(70)` | Yes | No | No | `` |  |
| 18 | `Pe` | `nvarchar(50)` | Yes | No | No | `` |  |
| 19 | `PopravekNabavneVrednosti` | `float` | Yes | No | No | `` |  |
| 20 | `PoslovnoLeto` | `nvarchar(2)` | Yes | No | No | `` |  |
| 21 | `RecNo` | `int` | No | Yes | No | `` |  |
| 22 | `RevalorizacijaAmortizacije` | `float` | Yes | No | No | `` |  |
| 23 | `RevalorizacijaNabavneVrednosti` | `float` | Yes | No | No | `` |  |
| 24 | `RevalorizacijaPopravkaVrednostiObracunanegaMedLetom` | `float` | Yes | No | No | `` |  |
| 25 | `RevalorizacijskiUcinek` | `float` | Yes | No | No | `` |  |
| 26 | `SedanjaVrednost` | `float` | Yes | No | No | `` |  |
| 27 | `SifraPartnerja` | `nvarchar(10)` | Yes | No | No | `` |  |
| 28 | `SkupniPopravekVrednosti` | `float` | Yes | No | No | `` |  |
| 29 | `Stevilka` | `int` | Yes | No | No | `` |  |
| 30 | `StevilkaFakture` | `smallint` | Yes | No | No | `` |  |
| 31 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 32 | `Vrsta` | `nvarchar(50)` | Yes | No | No | `` |  |
| 33 | `VrstaRacuna` | `smallint` | Yes | No | No | `` |  |
| 34 | `ZacetekAmortizacije` | `datetime` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | No | NONCLUSTERED | 1 | `Stevilka` | No |

## Check constraints

_None._
