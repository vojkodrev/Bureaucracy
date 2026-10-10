$ErrorActionPreference = "Stop"

$AppDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$Python = Join-Path $AppDirectory ".venv\Scripts\python.exe"
$Main = Join-Path $AppDirectory "main.py"

if (-not (Test-Path $Python -PathType Leaf)) {
    throw "Python virtual environment not found. Run install.ps1 first."
}

Push-Location $AppDirectory
try {
    & $Python $Main predict @args
    if ($LASTEXITCODE -ne 0) {
        exit $LASTEXITCODE
    }
}
finally {
    Pop-Location
}
