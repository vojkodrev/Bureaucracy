[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$backendDir = Join-Path $PSScriptRoot 'backend'
$frontendDir = Join-Path $PSScriptRoot 'frontend'
$keycloakDir = Join-Path $PSScriptRoot 'keycloak'
$backendScript = Join-Path $backendDir 'run-prod.ps1'
$frontendScript = Join-Path $frontendDir 'run-prod.ps1'
$keycloakScript = Join-Path $keycloakDir 'run-prod.ps1'

$shell = Get-Command pwsh.exe -ErrorAction SilentlyContinue
if (-not $shell) {
    $shell = Get-Command powershell.exe -ErrorAction Stop
}

$terminal = Get-Command wt.exe -ErrorAction Stop

function Quote-ProcessArgument([string] $value) {
    return '"' + $value.Replace('"', '\"') + '"'
}

$shellArgument = Quote-ProcessArgument $shell.Source

$terminalArguments = @(
    '-w', 'new'
    'new-tab'
    '--title', 'Backend'
    '--startingDirectory', (Quote-ProcessArgument $backendDir)
    $shellArgument, '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Quote-ProcessArgument $backendScript)
    ';'
    'split-pane', '--vertical', '--size', '0.5'
    '--title', 'Frontend'
    '--startingDirectory', (Quote-ProcessArgument $frontendDir)
    $shellArgument, '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Quote-ProcessArgument $frontendScript)
    ';'
    'split-pane', '--horizontal', '--size', '0.5'
    '--title', 'Keycloak'
    '--startingDirectory', (Quote-ProcessArgument $keycloakDir)
    $shellArgument, '-NoExit', '-ExecutionPolicy', 'Bypass', '-File', (Quote-ProcessArgument $keycloakScript)
)

$process = Start-Process -FilePath $terminal.Source `
    -ArgumentList $terminalArguments `
    -PassThru

if (-not $process.WaitForExit(10000)) {
    throw 'Windows Terminal did not finish processing the pane request.'
}
if ($process.ExitCode -ne 0) {
    throw "Windows Terminal could not create the panes (exit code $($process.ExitCode))."
}

exit 0
