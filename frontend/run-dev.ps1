param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

$certDir = Join-Path $PSScriptRoot '..\certs'
foreach ($name in @('bureaucracy.crt', 'bureaucracy.key')) {
    if (-not (Test-Path (Join-Path $certDir $name))) {
        throw 'HTTPS certificates are missing. Run certs\generate.ps1 first.'
    }
}

& npm.cmd install --prefix $PSScriptRoot
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& npm.cmd run dev --prefix $PSScriptRoot -- @RemainingArgs
exit $LASTEXITCODE
