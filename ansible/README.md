# Ansible Automation for MyFlix

Thư mục này chứa toàn bộ cấu hình Ansible phục vụ thực hành môn **DevOps (Đại học Đông Á)** và tự động hóa triển khai dự án **MyFlix**.

## 📁 Cấu trúc thư mục:
- `ansible.cfg`: Cấu hình mặc định (tự nhận `inventory.ini`).
- `inventory.ini`: Danh sách các nhóm máy chủ (`[web]`, `[dbservers]`, `[myflix_app]`).
- `playbook.yml`: Playbook mẫu theo đúng slide bài học (in thông điệp và uptime).
- `deploy_myflix.yml`: Playbook tự động deploy toàn bộ ứng dụng MyFlix (Frontend, Backend, MySQL) bằng Docker Compose.

---

## ⚡ Hướng dẫn chạy trên WSL (Ubuntu):

### 1. Di chuyển vào thư mục Ansible của dự án:
```bash
cd /mnt/d/DuAn/DuAn/myflix/ansible
```

### 2. Chạy bài mẫu theo slide của thầy:
```bash
ansible-playbook playbook.yml
```

### 3. Chạy Playbook Deploy toàn bộ dự án MyFlix:
```bash
ansible-playbook deploy_myflix.yml
```
