param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot
$buildDir = Join-Path $scriptDir '.bin'
$binary = Join-Path $buildDir 'bureaucracy-backend.exe'

New-Item -ItemType Directory -Path $buildDir -Force | Out-Null

& go -C $scriptDir build -trimpath '-ldflags=-s -w' -o $binary .
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

if ([string]::IsNullOrEmpty($env:APP_ENV)) {
    $env:APP_ENV = 'production'
}

Push-Location $scriptDir
try {
    & $binary @RemainingArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
