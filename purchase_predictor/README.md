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
.\train.ps1
```

On macOS or Linux, run `./install.sh`, copy and edit `.env`, then run
`./train.sh`.

Successful training writes a versioned model set under `models` and atomically
updates `models/active.json`.

After applying backend migration `00008`, create and store a prediction snapshot
for all active customer-product pairs with:

```powershell
.\.venv\Scripts\python.exe main.py predict
```

The cutoff defaults to today. For a reproducible historical run, pass
`--as-of YYYY-MM-DD`. The command loads the active 7-, 14-, and 30-day models
and stores typed feature and score columns in the prediction tables.

Completed cutoff snapshots and their typed feature rows are cached in
`Bureaucracy.dbo.purchase_prediction_training_snapshots` and
`Bureaucracy.dbo.purchase_prediction_training_rows`. Training loads compatible
snapshots from MSSQL and builds only missing cutoffs. Each newly built cutoff
is committed immediately, so an interrupted run resumes from its last completed
cutoff. Apply the backend database migrations before training.
