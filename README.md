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
ACCOUNT_VAULT_KEY=chuoi_bi_mat_ngau_nhien_toi_thieu_32_ky_tu
ACCOUNT_VAULT_READ_SESSION_MINUTES=480
ACCOUNT_VAULT_WRITE_SESSION_MINUTES=30
# Chỉ dùng khi đổi khóa và cần đọc dữ liệu đã mã hóa bằng khóa cũ:
# ACCOUNT_VAULT_LEGACY_KEY=khoa_cu
```

Khi có đủ `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, backend sẽ tự tạo bảng `app_data` và lưu toàn bộ dữ liệu app trong MySQL.

`ACCOUNT_VAULT_KEY` dùng để mã hóa xác thực AES-256-GCM cho mục **Quản lý tài khoản**. Khóa phải dài ít nhất 32 ký tự, giữ cố định, không đưa vào Git và nên được sao lưu trong trình quản lý bí mật. Nếu thiếu hoặc quá ngắn, kho tài khoản sẽ khóa an toàn và từ chối đọc/ghi; các phần khác của ứng dụng vẫn hoạt động.

Thông tin riêng tư gồm tên tài khoản, tên đăng nhập, mật khẩu, liên hệ khôi phục, đường dẫn và ghi chú đều nằm trong ciphertext. Hệ thống chỉ giữ nền tảng và tối đa 2 ký tự cuối mật khẩu ở dạng gợi ý. Khi đổi khóa, tạm khai báo khóa cũ bằng `ACCOUNT_VAULT_LEGACY_KEY`, khởi động để chuyển dữ liệu, sau đó xóa biến khóa cũ.

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

## Dùng chung dữ liệu giữa điện thoại và máy tính

- Trên tất cả thiết bị, mở cùng địa chỉ `https://saobienhonson.com`.
- `http://localhost:4173` là môi trường thử nghiệm trên máy tính và không tự dùng chung database Hostinger nếu máy local chưa được cấu hình các biến MySQL.
- Nếu dữ liệu đầy đủ đang nằm ở localhost, hãy sao lưu JSON tại localhost, sau đó đăng nhập `saobienhonson.com` trên máy tính và dùng **Cài đặt hệ thống → Nhập JSON lên MySQL** một lần.
- Website online lấy MySQL làm nguồn dữ liệu chính, tự kiểm tra dữ liệu mới khi quay lại tab và định kỳ mỗi 30 giây.
- Backend dùng phiên bản dữ liệu để ngăn một thiết bị đang giữ cache cũ ghi đè dữ liệu mới của thiết bị khác.
