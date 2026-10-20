# ==============================================================================
# SCRIPT TỰ ĐỘNG DEPLOY MYFLIX LÊN AWS EC2 (CHẠY TRÊN WINDOWS POWERSHELL)
# ==============================================================================
# Cách dùng:
# .\deploy-aws.ps1 -Ec2Ip "13.211.179.246" -KeyPath "D:\DuAn\myflix-key.pem.pem"
# ==============================================================================

param(
    [Parameter(Mandatory=$true, HelpMessage="Nhap dia chi Public IP cua may chu AWS EC2")]
    [string]$Ec2Ip,

    [Parameter(Mandatory=$true, HelpMessage="Nhap duong dan den file khoa SSH (.pem)")]
    [string]$KeyPath,

    [Parameter(Mandatory=$false)]
    [string]$User = "ubuntu"
)

# Chuyen ve dung thu muc cua script neu dang o thu muc khac
if ($PSScriptRoot) {
    Set-Location $PSScriptRoot
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  🚀 BẮT ĐẦU QUÁ TRÌNH DEPLOY MYFLIX (MONGODB) LÊN AWS EC2 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Target Server : $User@$Ec2Ip"
Write-Host "Key File      : $KeyPath"

# 1. Kiem tra file PEM ton tai
if (-not (Test-Path $KeyPath)) {
    Write-Host "❌ Khong tim thay file key tai: $KeyPath" -ForegroundColor Red
    exit 1
}

# 2. Tu dong fix permission cho file PEM tren Windows de tranh loi 'bad permissions'
Write-Host "`n[1/6] Cau hinh quyen bao mat cho file khoa SSH (.pem)..." -ForegroundColor Yellow
try {
    icacls "$KeyPath" /inheritance:r 2>$null | Out-Null
    icacls "$KeyPath" /grant:r "$($env:USERNAME):(R)" 2>$null | Out-Null
    icacls "$KeyPath" /remove "NT AUTHORITY\Authenticated Users" "BUILTIN\Users" 2>$null | Out-Null
    Write-Host "✅ Da toi uu quyen cho file key $KeyPath" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Khong the dat lai ACL, tiep tuc thu ket noi..." -ForegroundColor Gray
}

# 3. Kiem tra ket noi SSH
Write-Host "`n[2/6] Kiem tra ket noi SSH toi AWS EC2..." -ForegroundColor Yellow
$sshTest = ssh -i "$KeyPath" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$User@$Ec2Ip" "echo 'SSH_OK'"
if ($sshTest -notmatch "SSH_OK") {
    Write-Host "❌ Ket noi SSH that bai. Vui long kiem tra:" -ForegroundColor Red
    Write-Host "   - Public IP EC2 co dung khong?"
    Write-Host "   - AWS Security Group da mo Port 22 (Inbound SSH) chua?"
    Write-Host "   - File .pem co chinh xac voi Key Pair da chon khi tao EC2 khong?"
    exit 1
}
Write-Host "✅ Ket noi SSH toi AWS EC2 thanh cong!" -ForegroundColor Green

# 4. Kiem tra va cai dat Docker tren EC2
Write-Host "`n[3/6] Kiem tra & Cai dat Docker tren AWS EC2..." -ForegroundColor Yellow
$installDockerCmd = @'
if ! command -v docker &> /dev/null; then
    echo "Dang cai dat Docker..."
    sudo apt-get update -y
    sudo apt-get install -y docker.io docker-compose-v2
    sudo usermod -aG docker $USER
    sudo systemctl enable --now docker
    echo "Docker da duoc cai dat thanh cong!"
else
    echo "Docker da co san tren EC2."
fi
'@
ssh -i "$KeyPath" -o StrictHostKeyChecking=no "$User@$Ec2Ip" "$installDockerCmd"

# 5. Dong goi ma nguon va copy len EC2
Write-Host "`n[4/6] Dong goi ma nguon va tai len AWS EC2..." -ForegroundColor Yellow
tar --exclude="node_modules" --exclude=".git" --exclude="build" --exclude="*.tar.gz" -czf "myflix-deploy.tar.gz" .
scp -i "$KeyPath" -o StrictHostKeyChecking=no "myflix-deploy.tar.gz" "$User@$Ec2Ip:~/myflix-deploy.tar.gz"
Write-Host "✅ Da tai goi ma nguon len EC2!" -ForegroundColor Green

# 6. Giai nen va build/khoi dong cac Container MyFlix tren EC2
Write-Host "`n[5/6] Khoi dong cac Container MyFlix (Frontend, Backend, MongoDB 7.0)..." -ForegroundColor Yellow
$deployCmd = @'
mkdir -p ~/myflix
tar -xzf ~/myflix-deploy.tar.gz -C ~/myflix
cd ~/myflix
sudo docker compose -f docker-compose-full.yml down --remove-orphans || true
sudo docker compose -f docker-compose-full.yml up -d --build
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
'@
ssh -i "$KeyPath" -o StrictHostKeyChecking=no "$User@$Ec2Ip" "$deployCmd"

# 7. Kiem tra ket qua
Write-Host "`n[6/6] Kiem tra trang thai dich vu tren AWS..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  🎉 CHUC MUNG! MYFLIX DA DEPLOY THANH CONG LEN AWS EC2! " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "🌐 Frontend (Ung dung xem phim) : http://$Ec2Ip (hoac http://$Ec2Ip:3000)" -ForegroundColor Cyan
Write-Host "🔌 Backend API                   : http://$Ec2Ip:5000/api" -ForegroundColor Cyan
Write-Host "🩺 API Health Check              : http://$Ec2Ip:5000/api/health" -ForegroundColor Cyan
Write-Host "🍃 MongoDB URI                   : mongodb://$Ec2Ip:27017/myflix_db" -ForegroundColor Cyan
Write-Host "`nTai khoan Admin mac dinh:" -ForegroundColor Yellow
Write-Host "   Email    : admin123@gmail.com"
Write-Host "   Password : admin123"
Write-Host "==========================================================" -ForegroundColor Green
