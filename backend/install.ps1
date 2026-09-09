$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot

Write-Host 'Installing backend dependencies...'
& go -C $scriptDir mod download
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& go -C $scriptDir mod verify
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'Installation complete.'
