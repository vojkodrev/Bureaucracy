param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

& npm.cmd install --prefix $PSScriptRoot
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

& npm.cmd run dev --prefix $PSScriptRoot -- @RemainingArgs
exit $LASTEXITCODE
