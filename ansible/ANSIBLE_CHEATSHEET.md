# 📘 TỔNG HỢP KIẾN THỨC & LỆNH ANSIBLE (DEVOPS - ĐẠI HỌC ĐÔNG Á)

Tài liệu hướng dẫn thực hành tự động hóa với **Ansible** cho môn học **DevOps** và triển khai dự án **MyFlix** (React + Node.js + MySQL).

---

## 📁 1. Cấu trúc thư mục Ansible trong dự án

```text
myflix/
└── ansible/
    ├── ansible.cfg            # File cấu hình mặc định Ansible
    ├── inventory.ini          # File khai báo danh sách máy chủ (Hosts)
    ├── playbook.yml           # Playbook mẫu theo Slide thầy (Hello & Uptime)
    ├── deploy_myflix.yml      # Playbook tự động Deploy toàn bộ dự án MyFlix
    ├── README.md              # Hướng dẫn nhanh
    └── ANSIBLE_CHEATSHEET.md  # File tổng hợp toàn bộ câu lệnh (File này)
```

---

## 🛠️ 2. Các câu lệnh cần dùng

### 🔹 Bước 1: Vào thư mục & Khởi tạo môi trường (WSL)
```bash
# 1. Di chuyển vào thư mục ansible của dự án
cd /mnt/d/DuAn/DuAn/myflix/ansible

# 2. Khai báo file cấu hình (để tránh lỗi world-writable trên WSL)
export ANSIBLE_CONFIG=./ansible.cfg
```

> **Mẹo:** Để không phải gõ lệnh `export` mỗi lần mở terminal mới:
> ```bash
> echo 'export ANSIBLE_CONFIG=/mnt/d/DuAn/DuAn/myflix/ansible/ansible.cfg' >> ~/.bashrc
> ```

---

### 🔹 Bước 2: Lệnh Ad-hoc kiểm tra kết nối nhanh (Ping/Check)
```bash
# Ping kiểm tra kết nối tất cả các nhóm host
ansible all -m ping

# Ping riêng từng nhóm
ansible dbservers -m ping
ansible web -m ping
ansible myflix_app -m ping

# Chạy thử lệnh Linux nhanh trên tất cả các host (ví dụ: xem dung lượng ổ đĩa)
ansible all -a "df -h"
```

---

### 🔹 Bước 3: Lệnh chạy Playbook

```bash
# 1. Kiểm tra cú pháp (Syntax check) trước khi chạy
ansible-playbook playbook.yml --syntax-check
ansible-playbook deploy_myflix.yml --syntax-check

# 2. Chạy bài mẫu theo slide của Thầy (In Hello World + Lấy uptime)
ansible-playbook playbook.yml

# 3. Chạy Playbook tự động Deploy toàn bộ MyFlix (Frontend, Backend, MySQL)
ansible-playbook deploy_myflix.yml
```

---

### 🔹 Bước 4: Kiểm tra và Quản lý ứng dụng sau khi Deploy

```bash
# Xem danh sách các Container đang chạy
docker ps

# Xem log kiểm tra lỗi
docker logs -f myflix-backend-1
docker logs -f myflix-frontend-1

# Dừng toàn bộ các container MyFlix
docker compose -f ../docker-compose.prod.yml down
```

---

## 🔍 3. Giải thích ý nghĩa các thành phần chính

### 1. `inventory.ini` (Danh sách máy chủ)
```ini
[web]
localhost ansible_connection=local

[dbservers]
localhost ansible_connection=local

[myflix_app]
localhost ansible_connection=local
```
* `[tên_nhóm]`: Gom nhóm các máy chủ có cùng chức năng (Web, DB, App).
* `ansible_connection=local`: Chạy trực tiếp trên máy hiện tại. Khi có VPS/Server thật, thay `localhost` bằng IP và user SSH (ví dụ: `192.168.1.10 ansible_user=ubuntu`).

---

### 2. `playbook.yml` (Bài mẫu trên lớp)
* `hosts`: Chỉ định nhóm máy thực thi công việc (ví dụ `dbservers`).
* `gather_facts: no`: Bỏ qua bước quét thông tin phần cứng để chạy nhanh hơn.
* `vars`: Nơi khai báo biến (ví dụ `who: World`).
* `tasks`: Danh sách các công việc thực hiện tuần tự:
  * Module `debug`: In thông báo ra màn hình (`msg: "Hello {{ who }}"`).
  * Module `command`: Thực thi lệnh hệ thống (`uptime`).

---

### 3. `deploy_myflix.yml` (Tự động hóa Deploy MyFlix)
* Quét thông tin môi trường và phiên bản Docker.
* Tự động kéo Docker image mới nhất từ Docker Hub:
  * `tranthuy2312/myflix-frontend:latest`
  * `tranthuy2312/myflix-backend:latest`
  * `mysql:8.0`
* Tự động khởi chạy bằng `docker compose` ở chế độ ngầm (`-d`).
* Truy cập ứng dụng tại:
  * **Frontend (React)**: `http://localhost:3000`
  * **Backend (Node.js)**: `http://localhost:5000`

---

## ⚠️ 4. Các lỗi thường gặp & Cách xử lý

1. **Lỗi: `[WARNING]: Ansible is being run in a world writable directory...`**
   * **Nguyên nhân:** Chạy Ansible trên thư mục ổ Windows (`/mnt/d/...`) từ WSL.
   * **Cách sửa:** Chạy `export ANSIBLE_CONFIG=./ansible.cfg` hoặc thêm `-i inventory.ini` vào lệnh `ansible-playbook`.

2. **Lỗi: `skipping: no hosts matched`**
   * **Nguyên nhân:** Tên host trong Playbook không trùng với bất kỳ nhóm nào trong `inventory.ini`.
   * **Cách sửa:** Kiểm tra tên sau dòng `hosts:` trong playbook có đúng với nhóm trong `inventory.ini` không.
