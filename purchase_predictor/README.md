# Purchase predictor

The predictor trains three CatBoost classifiers that estimate whether an
existing customer-product pair will be purchased within 7, 14, or 30 days.
Purchase timing always uses `Racuni.DatumDUR` (service date), never the invoice
issue date.

The reader discovers historical databases from
`Birokrat.dbo.PoslovnaLeta`, then joins each `Racuni` table to its
`RacuniSpecifikacija` table. A pair is eligible at a cutoff when it was active
during the preceding 24 months. Each model has its own non-overlapping snapshot
cadence matching its horizon: every 7, 14, or 30 days. Once selected, the pair's
full history up to that cutoff is used for feature construction.

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
.\predict.ps1
```

The cutoff defaults to today. For a reproducible historical run, pass
`--as-of YYYY-MM-DD`, for example `./predict.sh --as-of 2026-10-10` on macOS or
Linux or `.\predict.ps1 --as-of 2026-10-10` on Windows. The command loads the
active 7-, 14-, and 30-day models and stores typed feature and score columns in
the prediction tables.

Completed cutoff snapshots and their typed feature rows are cached by horizon in
`Bureaucracy.dbo.purchase_prediction_training_snapshots` and
`Bureaucracy.dbo.purchase_prediction_training_rows`. Training loads compatible
snapshots from MSSQL and builds only missing cutoffs. Every stored row has one
complete `purchased_within_horizon` target; incomplete future windows are never
stored. Each newly built cutoff is committed immediately, so an interrupted run
resumes from its last completed cutoff. Apply the backend database migrations
before training.
