[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$backendDir = Join-Path $PSScriptRoot 'backend'
$frontendDir = Join-Path $PSScriptRoot 'frontend'
$keycloakDir = Join-Path $PSScriptRoot 'keycloak'
$backendScript = Join-Path $backendDir 'run-prod.ps1'
$frontendScript = Join-Path $frontendDir 'run-prod.ps1'
$keycloakScript = Join-Path $keycloakDir 'run-prod.ps1'

function Get-EnvironmentFileValue {
    param(
        [string] $Path,
        [string] $Name
    )

    if (-not (Test-Path $Path)) {
        return $null
    }

    foreach ($line in Get-Content -Path $Path) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith('#')) {
            continue
        }

        $separator = $trimmed.IndexOf('=')
        if ($separator -lt 1 -or $trimmed.Substring(0, $separator).Trim() -ne $Name) {
            continue
        }

        return $trimmed.Substring($separator + 1).Trim().Trim('"').Trim("'")
    }

    return $null
}

function Wait-ForKeycloak {
    $backendEnvironmentFile = Join-Path $backendDir '.env'
    $keycloakUrl = $env:KEYCLOAK_URL
    $keycloakRealm = $env:KEYCLOAK_REALM

    if ([string]::IsNullOrWhiteSpace($keycloakUrl)) {
        $keycloakUrl = Get-EnvironmentFileValue -Path $backendEnvironmentFile -Name 'KEYCLOAK_URL'
    }
    if ([string]::IsNullOrWhiteSpace($keycloakRealm)) {
        $keycloakRealm = Get-EnvironmentFileValue -Path $backendEnvironmentFile -Name 'KEYCLOAK_REALM'
    }

    if ([string]::IsNullOrWhiteSpace($keycloakUrl)) {
        $keycloakUrl = 'http://localhost:8180'
    }
    if ([string]::IsNullOrWhiteSpace($keycloakRealm)) {
        $keycloakRealm = 'bureaucracy'
    }

    $readyUrl = "$($keycloakUrl.TrimEnd('/'))/realms/$keycloakRealm"
    Write-Host "Waiting for Keycloak at $readyUrl..."
    while ($true) {
        try {
            $response = Invoke-WebRequest -Uri $readyUrl -Method Get -TimeoutSec 5 -UseBasicParsing
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
                Write-Host 'Keycloak is ready.'
                return
            }
        }
        catch {
            # Keycloak is still starting.
        }

        Start-Sleep -Seconds 2
    }
}

$shell = Get-Command pwsh.exe -ErrorAction SilentlyContinue
if (-not $shell) {
    $shell = Get-Command powershell.exe -ErrorAction Stop
}

$terminal = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($terminal) {
    # Keep all services visible in one Windows Terminal window, similar to tmux panes.
    $terminalWindow = "Bureaucracy-$PID"
    & $terminal.Source -w $terminalWindow `
        new-tab --title 'Keycloak' --startingDirectory $keycloakDir `
        $shell.Source -NoExit -ExecutionPolicy Bypass -File $keycloakScript `; `
        split-pane --vertical --size 0.5 --title 'Frontend' --startingDirectory $frontendDir `
        $shell.Source -NoExit -ExecutionPolicy Bypass -File $frontendScript

    Wait-ForKeycloak

    & $terminal.Source -w $terminalWindow `
        split-pane --horizontal --size 0.5 --title 'Backend' --startingDirectory $backendDir `
        $shell.Source -NoExit -ExecutionPolicy Bypass -File $backendScript

    exit $LASTEXITCODE
}

Write-Warning 'Windows Terminal (wt.exe) was not found. Opening three PowerShell windows instead.'

Start-Process -FilePath $shell.Source -WorkingDirectory $keycloakDir -ArgumentList @(
    '-NoExit'
    '-ExecutionPolicy', 'Bypass'
    '-File', $keycloakScript
)

Start-Process -FilePath $shell.Source -WorkingDirectory $frontendDir -ArgumentList @(
    '-NoExit'
    '-ExecutionPolicy', 'Bypass'
    '-File', $frontendScript
)

Wait-ForKeycloak

Start-Process -FilePath $shell.Source -WorkingDirectory $backendDir -ArgumentList @(
    '-NoExit'
    '-ExecutionPolicy', 'Bypass'
    '-File', $backendScript
)
