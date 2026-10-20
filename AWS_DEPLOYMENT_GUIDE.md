# 🚀 HƯỚNG DẪN TRIỂN KHAI MYFLIX (MONGODB) LÊN AWS TOÀN DIỆN

Tài liệu hướng dẫn chi tiết các bước đưa toàn bộ hệ thống **MyFlix** (React Frontend + Node.js Backend + MongoDB) lên máy chủ đám mây **AWS EC2**.

---

## 📌 PHẦN 1: NHỮNG GÌ ĐÃ ĐƯỢC CẤU HÌNH SẴN CHO BẠN
1. **Chuyển đổi hoàn toàn Database sang MongoDB (Mongoose)**:
   - Đã tạo Mongoose Model `Movie` và `User` với đầy đủ tính năng tương thích ngược ID với Frontend.
   - Đã nạp (seed) tự động **80 bộ phim** vào Database `myflix_db` collection `movies`.
   - Đã khởi tạo sẵn tài khoản Admin: `admin123@gmail.com` / `admin123`.
2. **Cập nhật Docker & Nginx**:
   - `docker-compose-full.yml`: Chạy Frontend + Backend + MongoDB 7.0 trên máy dev.
   - `docker-compose.prod.yml`: Bộ container chuẩn bị sẵn sàng kéo image để chạy trên AWS EC2.
   - `nginx.conf`: Đã thêm cấu hình Reverse Proxy chuyển tiếp `/api/` tới Backend.
3. **Bộ công cụ Deploy tự động 1-Click**:
   - `deploy-aws.ps1`: Tự động setup Docker và deploy từ Windows PowerShell.
   - `deploy-aws.sh`: Tự động deploy từ Linux / Mac / WSL.
   - `ansible/setup_aws_ec2.yml` & `ansible/deploy_myflix.yml`: Bộ playbook chuẩn DevOps Ansible.

---

## 📌 PHẦN 2: BẠN CẦN LÀM GÌ TRÊN AWS (4 BƯỚC ĐƠN GIẢN)

### 🔹 BƯỚC 1: Khởi tạo máy chủ EC2 trên AWS Console
1. Đăng nhập vào [AWS Management Console](https://console.aws.amazon.com/).
2. Vào dịch vụ **EC2** > Bấm **Launch instances**.
3. Điền thông tin:
   - **Name**: `myflix-server`
   - **OS Image**: Chọn **Ubuntu** (Ubuntu Server 22.04 LTS hoặc 24.04 LTS).
   - **Instance type**: Chọn `t2.micro` (Miễn phí Free Tier) hoặc `t3.small` / `t3.medium`.
   - **Key pair (login)**: Bấm **Create new key pair**:
     - Key pair name: `myflix-key`
     - Key pair type: `RSA`
     - Private key file format: Chọn `.pem` (cho OpenSSH).
     - Bấm **Create key pair** và lưu file `myflix-key.pem` vào máy tính (ví dụ: `C:\Users\ThinkBook\Downloads\myflix-key.pem`).

---

### 🔹 BƯỚC 2: Cấu hình tường lửa (Security Group)
Trong mục **Network settings** khi tạo EC2 (hoặc vào Security Groups sửa sau):
Bấm **Edit** và thêm các **Inbound security group rules**:

| Type | Port Range | Source | Mục đích |
| :--- | :--- | :--- | :--- |
| **SSH** | `22` | `0.0.0.0/0` (hoặc My IP) | Điều khiển máy chủ qua SSH / Ansible |
| **HTTP** | `80` | `0.0.0.0/0` | Truy cập trang web MyFlix trực tiếp |
| **Custom TCP** | `3000` | `0.0.0.0/0` | Port dự phòng Frontend |
| **Custom TCP** | `5000` | `0.0.0.0/0` | Port Backend API trực tiếp |
| **Custom TCP** | `8080` | `0.0.0.0/0` | Port Backend API nội bộ |
| **Custom TCP** | `27017` | `0.0.0.0/0` (tùy chọn) | Kết nối từ xa qua MongoDB Compass |

Sau đó bấm **Launch instance** và đợi khoảng 1-2 phút cho máy chuyển sang trạng thái `Running`.

---

### 🔹 BƯỚC 3: Lấy Public IP của EC2
1. Bấm vào instance vừa tạo.
2. Sao chép địa chỉ **Public IPv4 address** (ví dụ: `54.254.120.35`).

---

### 🔹 BƯỚC 4: Chạy lệnh Deploy 1-Click từ máy tính của bạn

Mở **PowerShell** tại thư mục dự án `d:\DuAn\DuAn\myflix` và chạy lệnh:

```powershell
.\deploy-aws.ps1 -Ec2Ip "ĐIỀN_PUBLIC_IP_EC2" -KeyPath "ĐƯỜNG_DẪN_FILE_PEM"
```

**Ví dụ cụ thể:**
```powershell
.\deploy-aws.ps1 -Ec2Ip "54.254.120.35" -KeyPath "C:\Users\ThinkBook\Downloads\myflix-key.pem"
```

> **Hoặc nếu dùng Ansible (WSL / Linux):**
> 1. Mở file `ansible/inventory.ini`, sửa dòng IP EC2 và đường dẫn file key `.pem`.
> 2. Chạy:
> ```bash
> cd /mnt/d/DuAn/DuAn/myflix/ansible
> ansible-playbook deploy_myflix.yml
> ```

---

## 📌 PHẦN 3: KIỂM TRA ỨNG DỤNG SAU KHI DEPLOY
Sau khi script hoàn tất, toàn bộ hệ thống đã chạy online:
- 🌐 **Trang chủ Xem Phim**: `http://<PUBLIC_IP_EC2>`
- 🔌 **API Phim**: `http://<PUBLIC_IP_EC2>:5000/api/movies`
- 🩺 **Kiểm tra trạng thái DB**: `http://<PUBLIC_IP_EC2>:5000/api/health`
- 🍃 **Kết nối từ MongoDB Compass**: `mongodb://<PUBLIC_IP_EC2>:27017/myflix_db`
- 🔐 **Tài khoản Admin quản trị**:
  - Email: `admin123@gmail.com`
  - Password: `admin123`
