# `dbo`.`PoslovnaLeta`

_No table description is defined in MSSQL._

- Rows: 22
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `AktivnaDeviznaBlagajna` | `nvarchar(1)` | Yes | No | No | `` |  |
| 2 | `AktivnaMaloprodaja` | `nvarchar(2)` | Yes | No | No | `` |  |
| 3 | `AktivnaProizvodnja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 4 | `AktivnaProizvodnjaNaziv` | `nvarchar(50)` | Yes | No | No | `` |  |
| 5 | `AktivnaSITBlagajna` | `nvarchar(1)` | Yes | No | No | `` |  |
| 6 | `AktivniSITRacun` | `nvarchar(3)` | Yes | No | No | `` |  |
| 7 | `ArtikelVOpis` | `smallint` | Yes | No | No | `` |  |
| 8 | `BarKodaAvtomatsko` | `smallint` | Yes | No | No | `` |  |
| 9 | `BarKodaVOpis` | `smallint` | Yes | No | No | `` |  |
| 11 | `DavcnaIzpostava` | `nvarchar(5)` | Yes | No | No | `` |  |
| 12 | `DavcnaStevilka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 13 | `DavekOdRealizacije` | `smallint` | Yes | No | No | `` |  |
| 14 | `DavekPoSkupinah` | `smallint` | Yes | No | No | `` |  |
| 15 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 16 | `DDVDelez1` | `float` | Yes | No | No | `` |  |
| 17 | `DDVDelez2` | `float` | Yes | No | No | `` |  |
| 18 | `DDVDelez3` | `float` | Yes | No | No | `` |  |
| 19 | `DDVDelez4` | `float` | Yes | No | No | `` |  |
| 20 | `DDVDelezDatum1` | `datetime` | Yes | No | No | `` |  |
| 21 | `DDVDelezDatum2` | `datetime` | Yes | No | No | `` |  |
| 22 | `DDVDelezDatum3` | `datetime` | Yes | No | No | `` |  |
| 23 | `DDVDelezDatum4` | `datetime` | Yes | No | No | `` |  |
| 24 | `DDVUpostevajPrejsnjeLeto` | `smallint` | Yes | No | No | `` |  |
| 25 | `DDVZavezanec` | `smallint` | Yes | No | No | `` |  |
| 26 | `DirektorPodjetja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 27 | `DobaviteljVPRAC` | `smallint` | Yes | No | No | `` |  |
| 28 | `DobavnicaBrezZneskov` | `smallint` | Yes | No | No | `` |  |
| 29 | `DobavnicaRazknjizuje` | `smallint` | Yes | No | No | `` |  |
| 30 | `DodatekArtikla` | `smallint` | Yes | No | No | `` |  |
| 31 | `DodatekNazivaZaRacun` | `smallint` | Yes | No | No | `` |  |
| 32 | `DodatekStevilkiRacuna` | `smallint` | Yes | No | No | `` |  |
| 33 | `DOO` | `smallint` | Yes | No | No | `` |  |
| 34 | `DovoljenaProdajaBrezZaloge` | `smallint` | Yes | No | No | `` |  |
| 35 | `DovoljenaProdajaBrezZalogeLP` | `smallint` | Yes | No | No | `` |  |
| 36 | `DovoljenPredracunBrezZaloge` | `smallint` | Yes | No | No | `` |  |
| 37 | `EMAIL` | `nvarchar(50)` | Yes | No | No | `` |  |
| 38 | `EMSO` | `nvarchar(14)` | Yes | No | No | `` |  |
| 39 | `FIFO` | `smallint` | Yes | No | No | `` |  |
| 40 | `HitraIzbira` | `smallint` | Yes | No | No | `` |  |
| 41 | `ImePodjetja` | `nvarchar(60)` | Yes | No | No | `` |  |
| 42 | `IzdaniNaDatumOdpreme` | `smallint` | Yes | No | No | `` |  |
| 43 | `IzhajaIz` | `nvarchar(50)` | Yes | No | No | `` |  |
| 44 | `IzhodiscniSaldo` | `float` | Yes | No | No | `` |  |
| 45 | `IzhodiscniSaldoDevizna` | `float` | Yes | No | No | `` |  |
| 46 | `IzkajaIzOpis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 47 | `IzkajaIzOznaka` | `nvarchar(3)` | Yes | No | No | `` |  |
| 48 | `IzpisDopisnegaLista` | `smallint` | Yes | No | No | `` |  |
| 49 | `IzpisDopisnegaListaTextovno` | `smallint` | Yes | No | No | `` |  |
| 50 | `IzpisRacunaZNalogomZaPlacilo` | `smallint` | Yes | No | No | `` |  |
| 51 | `IzpisVBarvah` | `smallint` | Yes | No | No | `` |  |
| 52 | `Knjigovodstvo` | `smallint` | Yes | No | No | `` |  |
| 53 | `KrajPodjetja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 54 | `LetniDelovnikUr` | `smallint` | Yes | No | No | `` |  |
| 55 | `LetoKnjizenja` | `smallint` | Yes | No | No | `` |  |
| 56 | `LetoPoslovanja` | `smallint` | Yes | No | No | `` |  |
| 57 | `MaticnaStevilka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 58 | `MesecKnjizenja` | `smallint` | Yes | No | No | `` |  |
| 59 | `MPCeneRazlicno` | `smallint` | Yes | No | No | `` |  |
| 60 | `NabavniSoProdajni` | `smallint` | Yes | No | No | `` |  |
| 61 | `NaslovKP` | `nvarchar(50)` | Yes | No | No | `` |  |
| 62 | `NaslovPodjetja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 63 | `NastavitevLPT` | `smallint` | Yes | No | No | `` |  |
| 64 | `NiDavka` | `smallint` | Yes | No | No | `` |  |
| 65 | `OblikaRacuna` | `smallint` | Yes | No | No | `` |  |
| 66 | `ObNapakiZalogePostaviNCNaZadnjoNC` | `smallint` | Yes | No | No | `` |  |
| 67 | `Opis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 68 | `OpisDejavnosti` | `nvarchar(100)` | Yes | No | No | `` |  |
| 69 | `OpisDodatka1` | `nvarchar(50)` | Yes | No | No | `` |  |
| 70 | `OpisDodatka2` | `nvarchar(50)` | Yes | No | No | `` |  |
| 71 | `OpisDodatka3` | `nvarchar(50)` | Yes | No | No | `` |  |
| 72 | `OpisDodatka4` | `nvarchar(50)` | Yes | No | No | `` |  |
| 73 | `Oznaka` | `nvarchar(50)` | Yes | No | No | `` |  |
| 74 | `PartnerUnique` | `smallint` | Yes | No | No | `` |  |
| 75 | `PEObvezenPodatek` | `smallint` | Yes | No | No | `` |  |
| 76 | `PEVecnivojsko` | `int` | Yes | No | No | `` |  |
| 77 | `PEVecnivojskoEnotno` | `smallint` | Yes | No | No | `` |  |
| 78 | `PovratnicaPoDobavi` | `smallint` | Yes | No | No | `` |  |
| 79 | `PovzetekRabata` | `smallint` | Yes | No | No | `` |  |
| 80 | `PrejetiNaDatumOdpreme` | `smallint` | Yes | No | No | `` |  |
| 81 | `PrenosBrezOtvoritve` | `smallint` | Yes | No | No | `` |  |
| 82 | `ProdajaIzCeneBrezDavka` | `smallint` | Yes | No | No | `` |  |
| 83 | `PrviNivo` | `smallint` | Yes | No | No | `` |  |
| 85 | `Registracija` | `nvarchar(255)` | Yes | No | No | `` |  |
| 86 | `RegistrskaStevilkaZPIZ` | `nvarchar(50)` | Yes | No | No | `` |  |
| 87 | `RVCOpis` | `nvarchar(50)` | Yes | No | No | `` |  |
| 88 | `RVCProcent` | `float` | Yes | No | No | `` |  |
| 89 | `RVCSifra` | `nvarchar(5)` | Yes | No | No | `` |  |
| 90 | `SDKPodjetja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 91 | `SifraDejavnosti` | `nvarchar(50)` | Yes | No | No | `` |  |
| 92 | `SifraODPokojnina` | `smallint` | Yes | No | No | `` |  |
| 93 | `SifraProracunskegaUporabnika` | `nvarchar(10)` | Yes | No | No | `` |  |
| 94 | `SklicPodjetja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 95 | `SortirajRacun` | `smallint` | Yes | No | No | `` |  |
| 96 | `SpremembaSestave` | `smallint` | Yes | No | No | `` |  |
| 97 | `StariObrazci` | `smallint` | Yes | No | No | `` |  |
| 98 | `StevilkaPrenosaVGK` | `smallint` | Yes | No | No | `` |  |
| 99 | `StoritveBrezSestave` | `smallint` | Yes | No | No | `` |  |
| 100 | `TecajDnevnice` | `smallint` | Yes | No | No | `` |  |
| 101 | `TecajNabava` | `smallint` | Yes | No | No | `` |  |
| 102 | `TecajNakupDeviz` | `smallint` | Yes | No | No | `` |  |
| 103 | `TecajProdaja` | `smallint` | Yes | No | No | `` |  |
| 104 | `TecajProvizijaZaNakup` | `smallint` | Yes | No | No | `` |  |
| 105 | `TecajProvizijaZaNakupDeviz` | `smallint` | Yes | No | No | `` |  |
| 106 | `TedenskiDelovnikUr` | `smallint` | Yes | No | No | `` |  |
| 107 | `Telefon` | `nvarchar(50)` | Yes | No | No | `` |  |
| 108 | `ValutaZaPN` | `nvarchar(5)` | Yes | No | No | `` |  |
| 109 | `VecDeviznihBlagajn` | `smallint` | Yes | No | No | `` |  |
| 110 | `VecSITBlagajn` | `smallint` | Yes | No | No | `` |  |
| 111 | `VecSITRacunov` | `smallint` | Yes | No | No | `` |  |
| 112 | `VerzijaPrograma` | `int` | Yes | No | No | `` |  |
| 113 | `Virman` | `smallint` | Yes | No | No | `` |  |
| 114 | `VirmanBrezPartnerjaInZR` | `smallint` | Yes | No | No | `` |  |
| 115 | `VirmaniSkupaj` | `smallint` | Yes | No | No | `` |  |
| 116 | `ViskiManjkiAvtomatsko` | `smallint` | Yes | No | No | `` |  |
| 117 | `ViskiManjkiAvtomatskoNaInventuro` | `smallint` | Yes | No | No | `` |  |
| 118 | `Vnasalec` | `nvarchar(20)` | Yes | No | No | `` |  |
| 119 | `VpisArtikel` | `nvarchar(13)` | Yes | No | No | `` |  |
| 120 | `VpisOpisArtikla` | `nvarchar(50)` | Yes | No | No | `` |  |
| 121 | `VpisStopnjaDavka` | `float` | Yes | No | No | `` |  |
| 122 | `VrstaCentralnegaSkladisca` | `smallint` | Yes | No | No | `` |  |
| 123 | `VstopniceArtikel` | `nvarchar(13)` | Yes | No | No | `` |  |
| 124 | `VstopniceOpisArtikla` | `nvarchar(50)` | Yes | No | No | `` |  |
| 125 | `VstopniceStopnjaDavka` | `float` | Yes | No | No | `` |  |
| 126 | `ZamakniKrajNaslovnika` | `smallint` | Yes | No | No | `` |  |
| 127 | `ZamikOD` | `smallint` | Yes | No | No | `` |  |
| 128 | `ZaokrozevanjeMaloprodajneCene` | `float` | Yes | No | No | `` |  |
| 129 | `ZaokrozevanjeProdaje` | `smallint` | Yes | No | No | `` |  |
| 130 | `ZaokrozevanjeProdajeMP` | `smallint` | Yes | No | No | `` |  |
| 131 | `ZapadlostDniVnaprej` | `smallint` | Yes | No | No | `` |  |
| 132 | `ZapriLeto` | `smallint` | Yes | No | No | `` |  |
| 133 | `ZavodDrustvo` | `smallint` | Yes | No | No | `` |  |
| 134 | `ZiroRacunPodjetja` | `nvarchar(50)` | Yes | No | No | `` |  |
| 135 | `ZunanjeRacunovodstvo` | `smallint` | Yes | No | No | `` |  |
| 136 | `DatumVnosa` | `nvarchar(12)` | Yes | No | No | `` |  |
| 137 | `RecNo` | `int` | No | Yes | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `Leta` | No | NONCLUSTERED | 1 | `Oznaka` | No |
| `Recno` | Yes | NONCLUSTERED | 1 | `RecNo` | No |

## Check constraints

_None._
