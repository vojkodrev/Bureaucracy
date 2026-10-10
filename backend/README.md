# Bureaucracy backend

The backend exposes BIRO225 invoices through an English GraphQL API.

```bash
./install.sh
./run-dev.sh
```

Generate the repository-wide development certificate with `../certs/generate.sh`
(or `..\certs\generate.ps1` on Windows), trust `bureaucracy-ca.crt`, and then
open the GraphQL playground at <https://localhost:8080/> or send requests to
`https://localhost:8080/graphql`.

All routes except `GET /health` require a Keycloak access token in the
`Authorization: Bearer <token>` header. Configure the Keycloak issuer and the
allowed public client with `KEYCLOAK_URL`, `KEYCLOAK_REALM`, and
`KEYCLOAK_CLIENT_ID`. The backend verifies the token signature against the
realm JWKS as well as its issuer, expiry, and intended client.
During startup, the backend waits for the realm's signing keys, retrying failed
fetches every two seconds with a five-second timeout per attempt. Keycloak,
the backend, and the frontend can be launched together with `../run-prod.ps1`.

Scheduled jobs are defined in `cron_jobs.csv`. The database backup job runs
every day at 03:00 in the backend process's local timezone. At 04:00, the file
storage cleanup job removes uploads older than 24 hours that have not been
attached to a goods receipt. Cron is disabled by default; set `CRON_ENABLED=true`
in the production environment to enable scheduled jobs.

The purchase predictor trains all 7-, 14-, and 30-day models at 01:00 on the
first day of every month. It predicts all three horizons every Monday at 05:00.
Both schedules use the backend process's local timezone. One training job and
one prediction job are sufficient because each Python command handles all three
models. Install and configure `../purchase_predictor` before enabling cron. Set
`PURCHASE_PREDICTOR_DIRECTORY` if it is elsewhere and optionally set
`PURCHASE_PREDICTOR_PYTHON` to a Python executable; otherwise the job uses the
predictor's `.venv` executable for the current operating system. The subprocess
loads database and model settings from `purchase_predictor/.env`, overriding
same-named backend environment variables.

Set
`MSSQL_BACKUP_FOLDER` to a directory that the SQL Server service can write to,
such as `/var/opt/mssql/backups` on Linux or macOS-hosted containers, or
`H:\backups` on Windows. Because `BACKUP DATABASE` runs on SQL Server, this path
refers to the SQL Server host or container, not necessarily the backend host.
The job asks SQL Server to create the directory when it does not exist. Each
online, non-system database is written to `<database-name>.bak`. Daily backups
are appended as separate backup sets, allowing a specific backup position to be
selected during restore.

Invoice PDFs are served as inline documents from
`GET /api/invoices/:invoiceNumber/pdf`. The placeholder implementation does
not query the database yet.

```graphql
query SearchInvoices($invoiceNumber: String, $customerId: String, $customerName: String, $issuedFrom: Time, $issuedTo: Time, $page: Int, $pageSize: Int) {
  searchInvoices(invoiceNumber: $invoiceNumber, customerId: $customerId, customerName: $customerName, issuedFrom: $issuedFrom, issuedTo: $issuedTo, page: $page, pageSize: $pageSize) {
    invoices {
      id
      invoiceNumber
      customerName
      amount
      issueDate
    }
    totalCount
    page
    pageSize
    totalPages
  }
}
```

Variables:

```json
{
  "invoiceNumber": "00001"
}
```

`invoiceNumber`, `customerId`, and `customerName` perform partial searches
against the `BIRO225.dbo.Racuni.Stevilka`, `SifraPartnerja`, and `ImePartnerja`
columns. SQL Server controls case sensitivity via the database collation. All
filters are optional. `issuedFrom` and `issuedTo` filter `DatumIzstavitve` using
an inclusive date range. When no filters are supplied, the API returns all
invoices one page at a time. Pages default to 20 rows and are limited to 100.
