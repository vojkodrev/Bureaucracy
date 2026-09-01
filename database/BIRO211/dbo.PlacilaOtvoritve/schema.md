# `dbo`.`PlacilaOtvoritve`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumBanke` | `datetime` | Yes | No | No | `` |  |
| 2 | `DatumKnjizenja` | `datetime` | Yes | No | No | `` |  |
| 3 | `DatumPlacila` | `datetime` | Yes | No | No | `` |  |
| 4 | `DatumPrispetja` | `datetime` | Yes | No | No | `` |  |
| 5 | `DatumRacuna` | `datetime` | Yes | No | No | `` |  |
| 6 | `DatumStoritveOdpreme` | `datetime` | Yes | No | No | `` |  |
| 7 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 8 | `DatumZaDDV` | `datetime` | Yes | No | No | `` |  |
| 9 | `DatumZapadlosti` | `datetime` | Yes | No | No | `` |  |
| 10 | `GK` | `smallint` | Yes | No | No | `` |  |
| 11 | `ImePartnerja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 12 | `NacinNakazila` | `smallint` | Yes | No | No | `` |  |
| 13 | `NamenNakazila1` | `nvarchar(40)` | Yes | No | No | `` |  |
| 14 | `NamenNakazila2` | `nvarchar(40)` | Yes | No | No | `` |  |
| 15 | `Neplacano` | `float` | Yes | No | No | `` |  |
| 16 | `Nujno` | `smallint` | Yes | No | No | `` |  |
| 17 | `ObracunDDV` | `smallint` | Yes | No | No | `` |  |
| 18 | `Opombe` | `ntext` | Yes | No | No | `` |  |
| 19 | `OznakaLeta` | `nvarchar(2)` | Yes | No | No | `` |  |
| 20 | `Partner` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `PE` | `nvarchar(50)` | Yes | No | No | `` |  |
| 22 | `Placano` | `float` | Yes | No | No | `` |  |
| 23 | `RecNo` | `int` | No | Yes | No | `` |  |
| 24 | `Sifra1` | `nvarchar(6)` | Yes | No | No | `` |  |
| 25 | `Sifra2` | `nvarchar(2)` | Yes | No | No | `` |  |
| 26 | `Sifra3` | `nvarchar(2)` | Yes | No | No | `` |  |
| 27 | `SklicObremenitve1` | `nvarchar(2)` | Yes | No | No | `` |  |
| 28 | `SklicObremenitve2` | `nvarchar(20)` | Yes | No | No | `` |  |
| 29 | `SklicOdobritve1` | `nvarchar(4)` | Yes | No | No | `` |  |
| 30 | `SklicOdobritve2` | `nvarchar(25)` | Yes | No | No | `` |  |
| 31 | `StevilkaDokumenta` | `nvarchar(20)` | Yes | No | No | `` |  |
| 32 | `StevilkaPlacila` | `int` | Yes | No | No | `` |  |
| 33 | `StevilkaText` | `nvarchar(5)` | Yes | No | No | `` |  |
| 34 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 35 | `VD` | `nvarchar(5)` | Yes | No | No | `` |  |
| 36 | `VdobroRacuna` | `nvarchar(60)` | Yes | No | No | `` |  |
| 37 | `Vdobroracuna2` | `nvarchar(40)` | Yes | No | No | `` |  |
| 38 | `VDOpis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 39 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 40 | `VnesenaPlacila` | `float` | Yes | No | No | `` |  |
| 41 | `ZiroRacun` | `nvarchar(60)` | Yes | No | No | `` |  |
| 42 | `Znesek` | `float` | Yes | No | No | `` |  |
| 43 | `ZnesekDDV` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `DatumPrispetja` | No | NONCLUSTERED | 1 | `DatumPrispetja` | No |
| `DatumPrispetja` | No | NONCLUSTERED | 2 | `StevilkaPlacila` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `StevilkaPlacila` | No | NONCLUSTERED | 1 | `StevilkaPlacila` | No |
| `VDobroRacuna` | No | NONCLUSTERED | 1 | `VdobroRacuna` | No |
| `VDobroRacuna` | No | NONCLUSTERED | 2 | `DatumZapadlosti` | No |
| `VDobroRacuna` | No | NONCLUSTERED | 3 | `StevilkaPlacila` | No |

## Check constraints

_None._
