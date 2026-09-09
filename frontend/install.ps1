$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot

Write-Host 'Installing frontend dependencies...'
& npm.cmd ci --prefix $scriptDir
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'Installation complete.'
