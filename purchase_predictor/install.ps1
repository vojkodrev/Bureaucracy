$ErrorActionPreference = "Stop"

$AppDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$VirtualEnvironment = Join-Path $AppDirectory ".venv"
$Python = Join-Path $VirtualEnvironment "Scripts\python.exe"

$PythonCommand = Get-Command python -ErrorAction SilentlyContinue
$PythonArguments = @()

if (-not $PythonCommand) {
    $PythonCommand = Get-Command py -ErrorAction SilentlyContinue
    $PythonArguments = @("-3")
}

if (-not $PythonCommand) {
    throw "Python 3.12 or newer was not found. Install it and make it available as 'python' or 'py'."
}

if (-not (Test-Path $Python)) {
    & $PythonCommand.Source @PythonArguments -c "import sys; raise SystemExit(sys.version_info < (3, 12))"
    if ($LASTEXITCODE -ne 0) {
        throw "Python 3.12 or newer is required."
    }

    & $PythonCommand.Source @PythonArguments -m venv $VirtualEnvironment
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $Python -PathType Leaf)) {
        throw "Failed to create the virtual environment with $($PythonCommand.Source)."
    }
}

& $Python -m pip install --upgrade pip
& $Python -m pip install -r (Join-Path $AppDirectory "requirements.txt")

Write-Host "Installation complete."
Write-Host "Copy .env.example to .env, set the MSSQL values, then run:"
Write-Host ".\train.ps1"
