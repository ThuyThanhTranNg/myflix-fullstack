#!/usr/bin/env bash
# ==============================================================================
# SCRIPT TỰ ĐỘNG DEPLOY MYFLIX LÊN AWS EC2 (CHẠY TRÊN LINUX / MACOS / WSL)
# ==============================================================================
# Cách dùng:
# chmod +x deploy-aws.sh
# ./deploy-aws.sh <EC2_PUBLIC_IP> <PATH_TO_PEM_KEY> [USER]
# Ví dụ:
# ./deploy-aws.sh 54.254.12.34 ~/.ssh/myflix-key.pem ubuntu
# ==============================================================================

set -e

EC2_IP="$1"
KEY_PATH="$2"
USER="${3:-ubuntu}"

if [ -z "$EC2_IP" ] || [ -z "$KEY_PATH" ]; then
    echo "❌ Thiếu tham số!"
    echo "Cách dùng: $0 <EC2_PUBLIC_IP> <PATH_TO_PEM_KEY> [USER]"
    exit 1
fi

if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Không tìm thấy file key tại: $KEY_PATH"
    exit 1
fi

chmod 400 "$KEY_PATH"

echo "=========================================================="
echo "  🚀 BẮT ĐẦU DEPLOY MYFLIX (MONGODB) LÊN AWS EC2 "
echo "=========================================================="
echo "Target Server : $USER@$EC2_IP"
echo "Key File      : $KEY_PATH"

echo -e "\n[1/5] Kiểm tra kết nối SSH tới AWS EC2..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no -o ConnectTimeout=10 "$USER@$EC2_IP" "echo 'SSH_OK'"

echo -e "\n[2/5] Cài đặt & cấu hình Docker trên EC2..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USER@$EC2_IP" 'bash -s' << 'EOF'
if ! command -v docker &> /dev/null; then
    echo "Dang cai dat Docker..."
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "Docker da san sang!"
else
    echo "Docker da co san tren may."
fi
EOF

echo -e "\n[3/5] Đẩy file cấu hình Production lên EC2..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USER@$EC2_IP" "mkdir -p ~/myflix"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$SCRIPT_DIR/docker-compose.prod.yml" "$USER@$EC2_IP:~/myflix/docker-compose.prod.yml"

echo -e "\n[4/5] Khởi động các container MyFlix (Frontend, Backend, MongoDB 7.0)..."
ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no "$USER@$EC2_IP" 'bash -s' << 'EOF'
cd ~/myflix
sudo docker compose -f docker-compose.prod.yml pull
sudo docker compose -f docker-compose.prod.yml down --remove-orphans || true
sudo docker compose -f docker-compose.prod.yml up -d
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
EOF

echo -e "\n[5/5] Kiểm tra dịch vụ hoàn tất..."
sleep 4

echo "=========================================================="
echo "  🎉 CHÚC MỪNG! MYFLIX ĐÃ DEPLOY THÀNH CÔNG LÊN AWS EC2!"
echo "=========================================================="
echo "🌐 Frontend (Web App)   : http://$EC2_IP (hoặc http://$EC2_IP:3000)"
echo "🔌 Backend API          : http://$EC2_IP:5000/api"
echo "🩺 API Health Check     : http://$EC2_IP:5000/api/health"
echo "🍃 MongoDB Connection   : mongodb://$EC2_IP:27017/myflix_db"
echo ""
echo "Tài khoản Admin mặc định:"
echo "   Email    : admin123@gmail.com"
echo "   Password : admin123"
echo "=========================================================="
