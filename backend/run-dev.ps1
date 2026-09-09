param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

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
