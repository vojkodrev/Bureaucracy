# Purchase predictor

The first version trains three CatBoost classifiers that estimate whether an
existing customer-product pair will be purchased within 7, 14, or 30 days.
Purchase timing always uses `Racuni.DatumDUR` (service date), never the invoice
issue date.

The reader discovers historical databases from
`Birokrat.dbo.PoslovnaLeta`, then joins each `Racuni` table to its
`RacuniSpecifikacija` table. A pair is eligible at a weekly cutoff when it was
active during the preceding 24 months. Once selected, its full history up to
that cutoff is used for feature construction.

## Windows setup

Install Python 3.12 and Microsoft ODBC Driver 18 for SQL Server. Then run:

```powershell
.\install.ps1
Copy-Item .env.example .env
```

Edit `.env`, then train:

```powershell
.\.venv\Scripts\python.exe main.py train
```

Successful training writes a versioned model set under `models` and atomically
updates `models/active.json`.
