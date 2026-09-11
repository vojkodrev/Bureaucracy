param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

& npm.cmd run build --prefix $PSScriptRoot
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& npm.cmd run preview --prefix $PSScriptRoot -- --host 0.0.0.0 @RemainingArgs
exit $LASTEXITCODE
