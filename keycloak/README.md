# Keycloak

This directory contains the reproducible Windows and macOS setup for the
Bureaucracy Keycloak server. The downloaded server and all credentials remain
local and are excluded from Git.

## Prerequisites

- Windows PowerShell 5.1 or PowerShell 7, or macOS with Bash
- OpenJDK 25 (`choco install temurin25 -y` on Windows, or
  `brew install openjdk@25` on macOS)
- Microsoft SQL Server reachable from this machine

## Prepare SQL Server

Create a dedicated `keycloak` database and a dedicated SQL login. Do not use
the `master` database or the Bureaucracy application's database. Grant the
login ownership of the Keycloak database so Keycloak can create and migrate its
schema.

Keycloak recommends enabling `READ_COMMITTED_SNAPSHOT` on its MSSQL database.
Run the following as a database administrator while no clients are connected:

```sql
ALTER DATABASE keycloak SET READ_COMMITTED_SNAPSHOT ON;
```

## Install

From the repository root:

```powershell
.\keycloak\install.ps1
```

On macOS:

```bash
./keycloak/install.sh
```

The installer downloads the pinned Keycloak ZIP, verifies its SHA-256 checksum,
extracts it to `keycloak\server`, copies the committed configuration, and builds
an optimized MSSQL server. It also creates `keycloak\.env` from the example.

Edit `.env` before the first start. In particular, replace both placeholder
passwords and set `KC_HOSTNAME` to the URL that clients use over the VPN.
`KC_DB_URL_PROPERTIES` enables SQL Server transport encryption; only change
`trustServerCertificate` to `true` when the server uses an otherwise untrusted
certificate and you accept that tradeoff.

## Run

```powershell
.\keycloak\run-prod.ps1
```

On macOS:

```bash
./keycloak/run-prod.sh
```

Keycloak listens on HTTP port 8180 by default. The initial start imports the
`bureaucracy` realm and its public `bureaucracy-frontend` client. Imports do not
overwrite an existing realm; later configuration changes should be made through
the Admin Console or an explicit migration process.

The committed realm allows the hostnames currently used by the frontend. Update
the redirect URIs and web origins before installation if VPN clients use a
different hostname.

## Files and secrets

The following files are committed:

- `.env.example`
- `keycloak.conf.example`
- `realm-export.json`
- `install.ps1`
- `run-prod.ps1`
- `install.sh`
- `run-prod.sh`

The local `.env`, downloaded `server`, runtime `data`, and `logs` are ignored.
Never commit database passwords or the bootstrap administrator password.
