[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

$openssl = Get-Command openssl.exe -ErrorAction SilentlyContinue
if (-not $openssl) {
    $openssl = Get-Command openssl -ErrorAction Stop
}

$caCert = Join-Path $PSScriptRoot 'bureaucracy-ca.crt'
$caKey = Join-Path $PSScriptRoot 'bureaucracy-ca.key'
$cert = Join-Path $PSScriptRoot 'bureaucracy.crt'
$key = Join-Path $PSScriptRoot 'bureaucracy.key'
$request = Join-Path $PSScriptRoot 'bureaucracy.csr'
$config = Join-Path $PSScriptRoot 'bureaucracy.cnf'
$serial = Join-Path $PSScriptRoot 'bureaucracy-ca.srl'

foreach ($path in @($caCert, $caKey, $cert, $key)) {
    if (Test-Path $path) {
        throw "Certificate files already exist in '$PSScriptRoot'; remove them explicitly before regenerating."
    }
}

& $openssl.Source req -x509 -newkey rsa:4096 -sha256 -days 3650 -nodes `
    -keyout $caKey -out $caCert -subj '/CN=Bureaucracy Local CA' `
    -addext 'basicConstraints=critical,CA:TRUE' `
    -addext 'keyUsage=critical,keyCertSign,cRLSign'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $openssl.Source req -newkey rsa:2048 -nodes -keyout $key -out $request -subj '/CN=drevi-pc'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

@'
[server]
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:localhost,DNS:drevi-pc,IP:127.0.0.1,IP:::1
'@ | Set-Content -Path $config -Encoding ascii

try {
    & $openssl.Source x509 -req -in $request -CA $caCert -CAkey $caKey `
        -CAcreateserial -out $cert -days 825 -sha256 -extfile $config -extensions server
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Remove-Item -Path $request, $config, $serial -Force -ErrorAction SilentlyContinue
}

Write-Host "Certificates generated in '$PSScriptRoot'. Trust bureaucracy-ca.crt on client machines."
