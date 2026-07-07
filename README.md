# COCO BAY Internal Management

Ứng dụng web quản lý nội bộ COCO BAY Hòn Sơn: xe máy, thuê/trả xe, lịch thuê, bảo trì, thiết bị khách sạn, đặt phòng, nhân sự, phân quyền, báo cáo và sao lưu dữ liệu.

## Chạy local

```bash
npm start
```

Sau đó mở:

```text
http://localhost:4173
```

## Deploy Hostinger

Upload các file chính lên Node.js app trên Hostinger:

- `index.html`
- `app.js`
- `styles.css`
- `server.js`
- `package.json`
- `assets/`

Cấu hình:

- Startup file: `server.js`
- Start command: `npm start`
- Node.js: 18 hoặc 20

## Cấu hình MySQL trên Hostinger

Trong Hostinger, tạo database MySQL rồi thêm các biến môi trường cho Node.js app:

```text
DB_HOST=srv1866.hstgr.io
DB_NAME=ten_database_day_du
DB_USER=ten_user_day_du
DB_PASSWORD=mat_khau_database
ADMIN_EMAIL=admin@cocobay.vn
ADMIN_PASSWORD=mat_khau_admin_ban_dau
```

Khi có đủ `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, backend sẽ tự tạo bảng `app_data` và lưu toàn bộ dữ liệu app trong MySQL.

## Dữ liệu hiện tại

Nếu chưa cấu hình MySQL, ứng dụng vẫn lưu dữ liệu trong `localStorage` với key:

```text
cocoBayInternalDb.v1
```

Có thể sao lưu trong app tại:

```text
Cài đặt -> Sao lưu database JSON
```

Khi đã cấu hình MySQL, đăng nhập và dữ liệu sẽ dùng chung qua backend Node.js.
