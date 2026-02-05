param(
    [Parameter(Mandatory=$true)]
    [string]$HostName,

    [Parameter(Mandatory=$true)]
    [string]$UserName,

    [Parameter(Mandatory=$true)]
    [string]$PrivateKeyPath
)

Write-Host "🔍 Validating SSH Connection Details..." -ForegroundColor Cyan

# 1. Check Connectivity
Write-Host "`n1️⃣ Testing TCP Connectivity to $HostName port 22..."
try {
    $tcp = New-Object System.Net.Sockets.TcpClient
    $connect = $tcp.BeginConnect($HostName, 22, $null, $null)
    $success = $connect.AsyncWaitHandle.WaitOne(5000, $true)
    
    if ($success) {
        $tcp.EndConnect($connect)
        $tcp.Close()
        Write-Host "✅ Connection Successful! Port 22 is open." -ForegroundColor Green
    } else {
        Write-Host "❌ Connection Timed Out. Port 22 is blocked or unreachable." -ForegroundColor Red
        Write-Host "   -> Check your Server's Firewall / Security Group."
        Write-Host "   -> Ensure you are allowing Inbound TCP on Port 22."
        exit 1
    }
} catch {
    Write-Host "❌ Connection Failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Check Key Format
Write-Host "`n2️⃣ Checking Private Key Format..."
if (-not (Test-Path $PrivateKeyPath)) {
    Write-Host "❌ Key file not found at: $PrivateKeyPath" -ForegroundColor Red
    exit 1
}

$keyContent = Get-Content $PrivateKeyPath -Raw
if ($keyContent -match "^-----BEGIN.*PRIVATE KEY-----") {
    Write-Host "✅ Key Header looks correct." -ForegroundColor Green
} else {
    Write-Host "❌ Invalid Key Format." -ForegroundColor Red
    Write-Host "   -> Key must start with '-----BEGIN ... PRIVATE KEY-----'"
    Write-Host "   -> Ensure it is a Private Key, not a Public Key."
    exit 1
}

# 3. Attempt SSH Connection (requires ssh client)
Write-Host "`n3️⃣ Attempting actual SSH Login..."
if (Get-Command ssh -ErrorAction SilentlyContinue) {
    Write-Host "Running: ssh -i $PrivateKeyPath -o BatchMode=yes -o StrictHostKeyChecking=no $UserName@$HostName 'echo Connection Established'"
    ssh -i $PrivateKeyPath -o BatchMode=yes -o StrictHostKeyChecking=no $UserName@$HostName "echo '✅ SSH Login Successful!'"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n🎉 EVERYTHING LOOKS GOOD!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ SSH Login Failed. Check your username and key permissions." -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ SSH client not found in PATH. Skipping login test." -ForegroundColor Yellow
}
