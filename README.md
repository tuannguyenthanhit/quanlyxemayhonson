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

## Dữ liệu hiện tại

Ứng dụng đang lưu dữ liệu trong `localStorage` với key:

```text
cocoBayInternalDb.v1
```

Có thể sao lưu trong app tại:

```text
Cài đặt -> Sao lưu database JSON
```

Muốn nhiều người dùng chung dữ liệu trên hosting, cần nâng cấp thêm Node.js backend + MySQL database.
