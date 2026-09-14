[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$backendDir = Join-Path $PSScriptRoot 'backend'
$frontendDir = Join-Path $PSScriptRoot 'frontend'
$backendScript = Join-Path $backendDir 'run-prod.ps1'
$frontendScript = Join-Path $frontendDir 'run-prod.ps1'

$shell = Get-Command pwsh.exe -ErrorAction SilentlyContinue
if (-not $shell) {
    $shell = Get-Command powershell.exe -ErrorAction Stop
}

$terminal = Get-Command wt.exe -ErrorAction SilentlyContinue
if ($terminal) {
    # Keep both services visible in one Windows Terminal window, similar to tmux panes.
    & $terminal.Source -w new `
        new-tab --title 'Backend' --startingDirectory $backendDir `
        $shell.Source -NoExit -ExecutionPolicy Bypass -File $backendScript `; `
        split-pane --vertical --size 0.5 --title 'Frontend' --startingDirectory $frontendDir `
        $shell.Source -NoExit -ExecutionPolicy Bypass -File $frontendScript

    exit $LASTEXITCODE
}

Write-Warning 'Windows Terminal (wt.exe) was not found. Opening two PowerShell windows instead.'

Start-Process -FilePath $shell.Source -WorkingDirectory $backendDir -ArgumentList @(
    '-NoExit'
    '-ExecutionPolicy', 'Bypass'
    '-File', $backendScript
)

Start-Process -FilePath $shell.Source -WorkingDirectory $frontendDir -ArgumentList @(
    '-NoExit'
    '-ExecutionPolicy', 'Bypass'
    '-File', $frontendScript
)
