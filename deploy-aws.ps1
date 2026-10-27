# ==============================================================================
# SCRIPT TU DONG DEPLOY MYFLIX LEN AWS EC2 (POWERSHELL)
# ==============================================================================
param(
    [Parameter(Mandatory=$true)]
    [string]$Ec2Ip,

    [Parameter(Mandatory=$true)]
    [string]$KeyPath,

    [Parameter(Mandatory=$false)]
    [string]$User = "ubuntu"
)

if ($PSScriptRoot) {
    Set-Location $PSScriptRoot
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  BAT DAU QUA TRINH DEPLOY MYFLIX LEN AWS EC2 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Server : $User@$Ec2Ip"
Write-Host "Key File      : $KeyPath"

# 1. Kiem tra file PEM ton tai
if (-not (Test-Path $KeyPath)) {
    Write-Host "[ERROR] Khong tim thay file key tai: $KeyPath" -ForegroundColor Red
    exit 1
}

# 2. Fix permission cho file PEM tren Windows
Write-Host "`n[1/5] Cau hinh quyen bao mat cho file khoa SSH (.pem)..." -ForegroundColor Yellow
try {
    icacls "$KeyPath" /inheritance:r 2>$null | Out-Null
    icacls "$KeyPath" /grant:r "$($env:USERNAME):(R)" 2>$null | Out-Null
    icacls "$KeyPath" /remove "NT AUTHORITY\Authenticated Users" "BUILTIN\Users" 2>$null | Out-Null
    Write-Host "[OK] Da toi uu quyen cho file key $KeyPath" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Khong the dat lai ACL, tiep tuc..." -ForegroundColor Gray
}

# 3. Kiem tra ket noi SSH
Write-Host "`n[2/5] Kiem tra ket noi SSH toi AWS EC2..." -ForegroundColor Yellow
$sshTarget = "${User}@${Ec2Ip}"
$sshTest = ssh -i "$KeyPath" -o StrictHostKeyChecking=no -o ConnectTimeout=10 $sshTarget "echo SSH_OK"
if ($sshTest -notmatch "SSH_OK") {
    Write-Host "[ERROR] Ket noi SSH that bai toi $sshTarget" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Ket noi SSH toi AWS EC2 thanh cong!" -ForegroundColor Green

# 4. Dong goi ma nguon va copy len EC2
Write-Host "`n[3/5] Dong goi ma nguon va tai len AWS EC2..." -ForegroundColor Yellow
if (Test-Path "myflix-deploy.tar.gz") {
    Remove-Item "myflix-deploy.tar.gz" -Force
}
tar --exclude="node_modules" --exclude=".git" --exclude="build" --exclude="*.tar.gz" -czf "myflix-deploy.tar.gz" .
$remoteDest = "${User}@${Ec2Ip}:~/myflix-deploy.tar.gz"
scp -i "$KeyPath" -o StrictHostKeyChecking=no "myflix-deploy.tar.gz" $remoteDest
Write-Host "[OK] Da tai goi ma nguon len EC2!" -ForegroundColor Green

# 5. Giai nen va build/khoi dong cac Container MyFlix tren EC2
Write-Host "`n[4/5] Khoi dong va build cac Container MyFlix tren EC2..." -ForegroundColor Yellow
$remoteBuildCmd = "mkdir -p ~/myflix && tar -xzf ~/myflix-deploy.tar.gz -C ~/myflix && cd ~/myflix && sudo docker compose -f docker-compose-full.yml up -d --build frontend backend && sudo docker ps"
ssh -i "$KeyPath" -o StrictHostKeyChecking=no $sshTarget $remoteBuildCmd

# 6. Kiem tra ket qua
Write-Host "`n[5/5] Hoan tat deploy!" -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  CHUC MUNG! MYFLIX DA DEPLOY THANH CONG LEN AWS EC2!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Frontend (Web xem phim) : http://$Ec2Ip" -ForegroundColor Cyan
Write-Host "Backend API             : http://${Ec2Ip}:8080/api" -ForegroundColor Cyan
Write-Host "MongoDB URI             : mongodb://${Ec2Ip}:27017/myflix_db" -ForegroundColor Cyan
Write-Host "`nTai khoan Admin mac dinh:" -ForegroundColor Yellow
Write-Host "   Email    : admin123@gmail.com"
Write-Host "   Password : admin123"
Write-Host "==========================================================" -ForegroundColor Green
