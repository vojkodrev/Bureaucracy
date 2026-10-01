[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $RemainingArgs
)

$ErrorActionPreference = 'Stop'

$scriptDir = $PSScriptRoot
$serverDir = Join-Path $scriptDir 'server'
$keycloakCommand = Join-Path $serverDir 'bin\kc.bat'
$environmentFile = Join-Path $scriptDir '.env'

if (-not (Test-Path $keycloakCommand)) {
    throw 'Keycloak is not installed. Run keycloak\install.ps1 first.'
}

if (-not (Test-Path $environmentFile)) {
    throw 'keycloak\.env was not found. Copy .env.example to .env and configure it first.'
}

foreach ($line in Get-Content -Path $environmentFile) {
    $trimmed = $line.Trim()
    if ($trimmed.Length -eq 0 -or $trimmed.StartsWith('#')) {
        continue
    }

    $separator = $trimmed.IndexOf('=')
    if ($separator -lt 1) {
        throw "Invalid entry in '$environmentFile': $line"
    }

    $name = $trimmed.Substring(0, $separator).Trim()
    $value = $trimmed.Substring($separator + 1).Trim()
    if (($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
    }

    [Environment]::SetEnvironmentVariable($name, $value, 'Process')
}

$requiredVariables = @(
    'KC_DB_USERNAME',
    'KC_DB_PASSWORD',
    'KC_HOSTNAME',
    'KC_BOOTSTRAP_ADMIN_USERNAME',
    'KC_BOOTSTRAP_ADMIN_PASSWORD'
)

foreach ($name in $requiredVariables) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if ([string]::IsNullOrWhiteSpace($value) -or $value.StartsWith('replace_with_')) {
        throw "Set $name to a real value in keycloak\.env before starting Keycloak."
    }
}

Push-Location $serverDir
try {
    & $keycloakCommand start --optimized --import-realm @RemainingArgs
    exit $LASTEXITCODE
}
finally {
    Pop-Location
}
