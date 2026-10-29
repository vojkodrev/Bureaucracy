Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$CertificatePath = 'F:\bureaucracy\davcno potrjevanje cert\35954086-7.p12'

try {
    $resolvedPath = (Resolve-Path -LiteralPath $CertificatePath).Path
} catch {
    Write-Error "Certificate file not found: $CertificatePath"
    exit 1
}

$password = Read-Host "Password for '$resolvedPath'" -AsSecureString
$passwordPointer = [IntPtr]::Zero
$certificate = $null

try {
    # X509Certificate2 requires a string password on Windows PowerShell 5.1.
    # Keep that string alive only for the duration of the import.
    $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)

    $flags = [Security.Cryptography.X509Certificates.X509KeyStorageFlags]::EphemeralKeySet
    try {
        $certificate = [Security.Cryptography.X509Certificates.X509Certificate2]::new(
            $resolvedPath,
            $plainPassword,
            $flags
        )
    } catch [Security.Cryptography.CryptographicException] {
        throw "Could not open the certificate. Check that the file and password are correct. $($_.Exception.Message)"
    } finally {
        $plainPassword = $null
    }

    $enhancedKeyUsages = @(
        $certificate.Extensions |
            Where-Object { $_ -is [Security.Cryptography.X509Certificates.X509EnhancedKeyUsageExtension] } |
            ForEach-Object { $_.EnhancedKeyUsages | ForEach-Object { "$($_.FriendlyName) [$($_.Value)]" } }
    )

    $subjectAlternativeNames = @(
        $certificate.Extensions |
            Where-Object { $_.Oid.Value -eq '2.5.29.17' } |
            ForEach-Object { $_.Format($true) }
    )

    [pscustomobject]@{
        File                    = $resolvedPath
        Subject                 = $certificate.Subject
        Issuer                  = $certificate.Issuer
        SerialNumber            = $certificate.SerialNumber
        Thumbprint              = $certificate.Thumbprint
        ValidFrom               = $certificate.NotBefore
        ValidUntil              = $certificate.NotAfter
        IsCurrentlyValid        = (Get-Date) -ge $certificate.NotBefore -and (Get-Date) -le $certificate.NotAfter
        HasPrivateKey           = $certificate.HasPrivateKey
        SignatureAlgorithm      = "$($certificate.SignatureAlgorithm.FriendlyName) [$($certificate.SignatureAlgorithm.Value)]"
        PublicKeyAlgorithm      = "$($certificate.PublicKey.Oid.FriendlyName) [$($certificate.PublicKey.Oid.Value)]"
        EnhancedKeyUsages       = $enhancedKeyUsages -join '; '
        SubjectAlternativeNames = $subjectAlternativeNames -join '; '
    } | Format-List

    $chain = [Security.Cryptography.X509Certificates.X509Chain]::new()
    try {
        $chainIsValid = $chain.Build($certificate)
        Write-Host "Certificate chain valid: $chainIsValid"

        if ($chain.ChainStatus.Count -gt 0) {
            $chain.ChainStatus |
                Select-Object Status, StatusInformation |
                Format-Table -AutoSize
        }
    } finally {
        $chain.Dispose()
    }
} catch {
    Write-Error $_
    exit 1
} finally {
    if ($null -ne $certificate) {
        $certificate.Dispose()
    }
    if ($passwordPointer -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
    }
    $password = $null
}
