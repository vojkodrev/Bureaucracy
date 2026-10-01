[CmdletBinding()]
param(
    [string] $Version = '26.7.5',
    [string] $Sha256 = '30ef87fb7101c43d29688d1ae80c0588ff4a151b3330e9f664bf9692d398658a'
)

$ErrorActionPreference = 'Stop'

if (-not $IsWindows -and $PSVersionTable.PSEdition -eq 'Core') {
    throw 'This installer is intended to run on Windows.'
}

$java = Get-Command java.exe -ErrorAction SilentlyContinue
if (-not $java) {
    throw 'Java was not found. Install OpenJDK 25 first: choco install temurin25 -y'
}

$javaVersionOutput = & $java.Source -version 2>&1
if ($LASTEXITCODE -ne 0 -or ($javaVersionOutput -join "`n") -notmatch 'version "25(?:\.|\")') {
    throw "Keycloak requires the configured OpenJDK 25 installation. Found: $($javaVersionOutput -join ' ')"
}

$scriptDir = $PSScriptRoot
$serverDir = Join-Path $scriptDir 'server'
if (Test-Path $serverDir) {
    throw "Keycloak is already installed at '$serverDir'. Move or remove it explicitly before reinstalling."
}

$archiveName = "keycloak-$Version.zip"
$downloadUrl = "https://github.com/keycloak/keycloak/releases/download/$Version/$archiveName"
$temporaryDir = Join-Path ([System.IO.Path]::GetTempPath()) ("bureaucracy-keycloak-" + [guid]::NewGuid().ToString('N'))
$archivePath = Join-Path $temporaryDir $archiveName
$extractDir = Join-Path $temporaryDir 'extracted'

New-Item -ItemType Directory -Path $temporaryDir, $extractDir -Force | Out-Null

try {
    Write-Host "Downloading Keycloak $Version..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $archivePath

    $actualHash = (Get-FileHash -Path $archivePath -Algorithm SHA256).Hash
    if ($actualHash -ne $Sha256) {
        throw "Checksum verification failed. Expected $Sha256 but received $actualHash."
    }

    Expand-Archive -Path $archivePath -DestinationPath $extractDir
    $expandedServer = Join-Path $extractDir "keycloak-$Version"
    if (-not (Test-Path $expandedServer)) {
        throw "The archive did not contain the expected keycloak-$Version directory."
    }

    Move-Item -Path $expandedServer -Destination $serverDir
}
finally {
    if (Test-Path $temporaryDir) {
        Remove-Item -Path $temporaryDir -Recurse -Force
    }
}

$configTarget = Join-Path $serverDir 'conf\keycloak.conf'
Copy-Item -Path (Join-Path $scriptDir 'keycloak.conf.example') -Destination $configTarget

$importDir = Join-Path $serverDir 'data\import'
New-Item -ItemType Directory -Path $importDir -Force | Out-Null
Copy-Item -Path (Join-Path $scriptDir 'realm-export.json') -Destination (Join-Path $importDir 'bureaucracy-realm.json')

$environmentFile = Join-Path $scriptDir '.env'
if (-not (Test-Path $environmentFile)) {
    Copy-Item -Path (Join-Path $scriptDir '.env.example') -Destination $environmentFile
    Write-Warning "Created '$environmentFile'. Replace every placeholder password before starting Keycloak."
}

$keycloakCommand = Join-Path $serverDir 'bin\kc.bat'
& $keycloakCommand build --db=mssql
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Write-Host "Keycloak $Version was installed in '$serverDir'."
Write-Host 'Edit keycloak\.env, prepare the MSSQL database, then run keycloak\run-prod.ps1.'
