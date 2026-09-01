# `dbo`.`POSRacuni`

_No table description is defined in MSSQL._

- Rows: 0
- Sample data: [Open](data.md)

## Columns

| # | Column | SQL type | Nullable | Identity | Computed | Default | Description |
|---:|---|---|:---:|:---:|:---:|---|---|
| 1 | `ColExcel` | `smallint` | Yes | No | No | `` |  |
| 2 | `DatumIzstavitve` | `datetime` | Yes | No | No | `` |  |
| 3 | `DDV` | `smallint` | Yes | No | No | `` |  |
| 4 | `Dnevnik` | `smallint` | Yes | No | No | `` |  |
| 5 | `Dobavnica` | `float` | Yes | No | No | `` |  |
| 6 | `Hotelir` | `smallint` | Yes | No | No | `` |  |
| 7 | `Komentar` | `ntext` | Yes | No | No | `` |  |
| 8 | `Kupec` | `nvarchar(50)` | Yes | No | No | `` |  |
| 9 | `MPO` | `nvarchar(3)` | Yes | No | No | `` |  |
| 10 | `OznakaPrenosaVMP` | `nvarchar(2)` | Yes | No | No | `` |  |
| 11 | `PrenosVMP` | `float` | Yes | No | No | `` |  |
| 12 | `Prireditelj` | `nvarchar(5)` | Yes | No | No | `` |  |
| 13 | `Prodal` | `nvarchar(20)` | Yes | No | No | `` |  |
| 14 | `Receptor` | `int` | Yes | No | No | `` |  |
| 15 | `RecNo` | `int` | No | Yes | No | `` |  |
| 16 | `Reprezentanca` | `float` | Yes | No | No | `` |  |
| 17 | `Reprezentanca1` | `float` | Yes | No | No | `` |  |
| 18 | `RowExcel` | `smallint` | Yes | No | No | `` |  |
| 19 | `Selected` | `nvarchar(1)` | Yes | No | No | `` |  |
| 20 | `SifraRezervacije` | `nvarchar(10)` | Yes | No | No | `` |  |
| 21 | `Stevilka` | `nvarchar(10)` | Yes | No | No | `` |  |
| 22 | `StevilkaMize` | `int` | Yes | No | No | `` |  |
| 23 | `StevilkaZakljuckaDobavnice` | `smallint` | Yes | No | No | `` |  |
| 24 | `Storno` | `smallint` | Yes | No | No | `` |  |
| 25 | `Ura` | `nvarchar(50)` | Yes | No | No | `` |  |
| 26 | `Znesek` | `float` | Yes | No | No | `` |  |

## Primary and unique keys

_None._

## Foreign keys

_None._

## Other indexes

| Index | Unique | Type | Position | Column | Included |
|---|:---:|---|---:|---|:---:|
| `RecNo` | Yes | NONCLUSTERED | 1 | `RecNo` | No |
| `Stevilka` | Yes | NONCLUSTERED | 1 | `Stevilka` | No |
| `Stevilka` | Yes | NONCLUSTERED | 2 | `MPO` | No |

## Check constraints

_None._
