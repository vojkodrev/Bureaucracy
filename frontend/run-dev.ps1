param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

& npm.cmd run dev --prefix $PSScriptRoot -- @RemainingArgs
exit $LASTEXITCODE
