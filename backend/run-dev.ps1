param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

$certDir = Join-Path $PSScriptRoot '..\certs'
foreach ($name in @('bureaucracy.crt', 'bureaucracy.key', 'bureaucracy-ca.crt')) {
    if (-not (Test-Path (Join-Path $certDir $name))) {
        throw 'HTTPS certificates are missing. Run certs\generate.ps1 first.'
    }
}

if ([string]::IsNullOrEmpty($env:APP_ENV)) {
    $env:APP_ENV = 'development'
}

Push-Location $PSScriptRoot
try {
    & go run . @RemainingArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
