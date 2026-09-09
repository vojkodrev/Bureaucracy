$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot

Write-Host 'Generating GraphQL code from schema.graphqls...'
& go -C $scriptDir tool gqlgen generate
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host 'GraphQL schema resolved successfully.'
