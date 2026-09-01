# `dbo`.`ODVodilo`

_No table description is defined in MSSQL._

- Rows: 1
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 2 | `Dohodnina2Delodajalec` | `float` | Yes | No | No | `` |  |
| 3 | `KolicinikSP` | `float` | Yes | No | No | `` |  |
| 4 | `Leto` | `smallint` | Yes | No | No | `` |  |
| 5 | `Mesec` | `smallint` | Yes | No | No | `` |  |
| 6 | `MinimalnaPlaca` | `float` | Yes | No | No | `` |  |
| 7 | `NajnizjiBrutoOD` | `float` | Yes | No | No | `` |  |
| 8 | `NajvisjiBrutoOD` | `float` | Yes | No | No | `` |  |
| 9 | `NormiraniStroski` | `float` | Yes | No | No | `` |  |
| 10 | `NormiraniStroskiZaDohodnino` | `float` | Yes | No | No | `` |  |
| 11 | `NormiranoFiksno` | `smallint` | Yes | No | No | `` |  |
| 12 | `ObsegSredstevZaIzplacilo` | `float` | Yes | No | No | `` |  |
| 13 | `ObvezniMesecniDelovnik` | `float` | Yes | No | No | `` |  |
| 14 | `OlajsavaZa1Osebo` | `float` | Yes | No | No | `` |  |
| 15 | `OlajsavaZa1Otroka` | `float` | Yes | No | No | `` |  |
| 16 | `OlajsavaZa2Osebo` | `float` | Yes | No | No | `` |  |
| 17 | `OlajsavaZa2Otroka` | `float` | Yes | No | No | `` |  |
| 18 | `OlajsavaZa3Otroka` | `float` | Yes | No | No | `` |  |
| 19 | `OlajsavaZa4Otroka` | `float` | Yes | No | No | `` |  |
| 20 | `OlajsavaZa5Otroka` | `float` | Yes | No | No | `` |  |
| 21 | `OlajsavaZaNaslednjeOtroke` | `float` | Yes | No | No | `` |  |
| 22 | `OsnovaZaIzracunDohodnineOdrednegaDela` | `float` | Yes | No | No | `` |  |
| 23 | `OsnovaZaIzracunDohodnineOdregresa` | `float` | Yes | No | No | `` |  |
| 24 | `OsnovnaVrednostDelovneUre` | `float` | Yes | No | No | `` |  |
| 25 | `PokojninaNajmanjsiZnesek` | `float` | Yes | No | No | `` |  |
| 26 | `PokojninaNajvecjiZnesek` | `float` | Yes | No | No | `` |  |
| 27 | `PovprecnaPlacaVRS` | `float` | Yes | No | No | `` |  |
| 28 | `Prehrana` | `float` | Yes | No | No | `` |  |
| 29 | `Prevoz` | `float` | Yes | No | No | `` |  |
| 30 | `PrispevkiPlacani` | `smallint` | Yes | No | No | `` |  |
| 31 | `RecNo` | `int` | No | Yes | No | `` |  |
| 32 | `RefundiranoVBremeDelodajalca` | `smallint` | Yes | No | No | `` |  |
| 33 | `Regres` | `float` | Yes | No | No | `` |  |
| 34 | `SpecifikacijaPoDelih` | `smallint` | Yes | No | No | `` |  |
| 35 | `Telefon` | `nvarchar(20)` | Yes | No | No | `` |  |
| 36 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 37 | `ZaokrozevanjeVSIT` | `smallint` | Yes | No | No | `` |  |
| 38 | `ZdruzevanjeSeznamaPoImenuBanke` | `smallint` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Mesec` | Yes | NONCLUSTERED | 1 | `Leto` | No |
| `Mesec` | Yes | NONCLUSTERED | 2 | `Mesec` | No |
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
