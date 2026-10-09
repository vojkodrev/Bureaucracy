$ErrorActionPreference = "Stop"

$AppDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$VirtualEnvironment = Join-Path $AppDirectory ".venv"
$Python = Join-Path $VirtualEnvironment "Scripts\python.exe"

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
    throw "Python launcher 'py' was not found. Install Python 3.12 or newer first."
}

if (-not (Test-Path $Python)) {
    py -3.12 -m venv $VirtualEnvironment
}

& $Python -m pip install --upgrade pip
& $Python -m pip install -r (Join-Path $AppDirectory "requirements.txt")

Write-Host "Installation complete."
Write-Host "Copy .env.example to .env, set the MSSQL values, then run:"
Write-Host ".\.venv\Scripts\python.exe main.py train"

