const DB_KEY = "cocoBayInternalDb.v1";
const SESSION_KEY = "cocoBaySession.v1";
const API_BASE = "/api";

const apiState = {
  enabled: false,
  saveTimer: null,
  lastError: "",
  version: null,
  pendingDb: null,
  saving: false,
  refreshBound: false
};

function isProductionHost() {
  return !["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

const roles = {
  admin: "Admin",
  manager: "Manager",
  receptionist: "Receptionist",
  technician: "Technician"
};

const permissions = {
  admin: ["finance", "users", "settings", "reports", "audit", "costs", "manage", "hr", "booking_view", "booking_write", "booking_edit"],
  manager: ["finance", "reports", "costs", "manage", "rentals", "maintenance", "damage", "hr", "booking_view", "booking_write", "booking_edit"],
  receptionist: ["rentals", "photos", "damage", "booking_view", "booking_write"],
  technician: ["maintenance", "costs"]
};

const permissionCatalog = [
  ["booking_view", "L\u1ecbch \u0111\u1eb7t ph\u00f2ng - xem", "Xem timeline, b\u1ed9 l\u1ecdc kh\u00e1ch s\u1ea1n v\u00e0 chi ti\u1ebft nh\u00f3m kh\u00e1ch"],
  ["booking_write", "L\u1ecbch \u0111\u1eb7t ph\u00f2ng - ghi", "T\u1ea1o phi\u1ebfu \u0111\u1eb7t ph\u00f2ng v\u00e0 ghi d\u1eef li\u1ec7u m\u1edbi"],
  ["booking_edit", "L\u1ecbch \u0111\u1eb7t ph\u00f2ng - s\u1eeda", "S\u1eeda, c\u1eadp nh\u1eadt ho\u1eb7c x\u00f3a phi\u1ebfu \u0111\u1eb7t ph\u00f2ng"],
  ["manage", "Quản lý danh mục", "Xe, loại xe, thiết bị, chủ xe"],
  ["rentals", "Thuê & trả xe", "Tạo phiếu, giao xe, trả xe"],
  ["maintenance", "Sửa chữa/bảo trì", "Tạo và cập nhật phiếu sửa chữa"],
  ["damage", "Báo hư", "Báo xe hoặc thiết bị hư"],
  ["photos", "Hình ảnh", "Chụp/tải ảnh xe và thiết bị"],
  ["finance", "Tài chính", "Doanh thu, chi phí, lợi nhuận"],
  ["costs", "Chi phí sửa chữa", "Xem và nhập chi phí"],
  ["reports", "Báo cáo", "Xem/in/xuất báo cáo"],
  ["hr", "Quản lý nhân sự", "Nhân viên đang làm và người xin việc"],
  ["users", "Nhân viên & phân quyền", "Tạo tài khoản và cấu hình quyền"],
  ["audit", "Nhật ký hoạt động", "Xem lịch sử thao tác"],
  ["settings", "Cài đặt hệ thống", "Cấu hình và dữ liệu mẫu"]
];

const menu = [
  ["dashboard", "T\u1ed5ng quan", "all"],
  ["bookingTimeline", "L\u1ecbch \u0111\u1eb7t ph\u00f2ng", "booking_view"],
  ["hotels", "Kh\u00e1ch s\u1ea1n", "manage"],
  ["rooms", "Ph\u00f2ng", "manage"],
  ["motorbikes", "Xe m\u00e1y", "all"],
  ["bikeTypes", "Lo\u1ea1i xe", "manage"],
  ["rentals", "Thu\u00ea & tr\u1ea3 xe", "rentals"],
  ["calendar", "L\u1ecbch thu\u00ea xe", "all"],
  ["bikeMaintenance", "S\u1eeda ch\u1eefa xe", "maintenance"],
  ["equipment", "Thi\u1ebft b\u1ecb kh\u00e1ch s\u1ea1n", "all"],
  ["equipmentTypes", "Lo\u1ea1i thi\u1ebft b\u1ecb", "manage"],
  ["equipmentMaintenance", "S\u1eeda ch\u1eefa thi\u1ebft b\u1ecb", "maintenance"],
  ["maintenanceCalendar", "L\u1ecbch b\u1ea3o tr\u00ec", "all"],
  ["owners", "Ch\u1ee7 s\u1edf h\u1eefu xe", "manage"],
  ["finance", "Doanh thu v\u00e0 chi ph\u00ed", "finance"],
  ["reports", "B\u00e1o c\u00e1o", "reports"],
  ["notifications", "Th\u00f4ng b\u00e1o", "all"],
  ["hr", "Qu\u1ea3n l\u00fd nh\u00e2n s\u1ef1", "hr"],
  ["users", "Nh\u00e2n vi\u00ean", "users"],
  ["audit", "Nh\u1eadt k\u00fd ho\u1ea1t \u0111\u1ed9ng", "audit"],
  ["settings", "C\u00e0i \u0111\u1eb7t h\u1ec7 th\u1ed1ng", "settings"]
];

const menuTree = [
  { key: "dashboard" },
  { key: "bookingTimeline", children: [{ key: "hotels" }, { key: "rooms" }] },
  { key: "motorbikes", children: [{ key: "bikeTypes" }, { key: "rentals" }, { key: "calendar" }, { key: "bikeMaintenance" }] },
  { key: "equipment", children: [{ key: "equipmentTypes" }, { key: "equipmentMaintenance" }] },
  { key: "maintenanceCalendar" },
  { key: "owners" },
  { key: "finance" },
  { key: "reports" },
  { key: "notifications" },
  { key: "hr" },
  { key: "users" },
  { key: "audit" },
  { key: "settings" }
];

const menuMeta = {
  dashboard: { icon: "\u2302", color: "blue", desc: "T\u1ed5ng h\u1ee3p ho\u1ea1t \u0111\u1ed9ng v\u00e0 s\u1ed1 li\u1ec7u ch\u00ednh" },
  bookingTimeline: { icon: "\u25a6", color: "teal", desc: "Timeline \u0111\u1eb7t ph\u00f2ng t\u1ed5ng h\u1ee3p nhi\u1ec1u kh\u00e1ch s\u1ea1n" },
  hotels: { icon: "\u25a5", color: "blue", desc: "Danh s\u00e1ch kh\u00e1ch s\u1ea1n v\u00e0 s\u1ed1 ph\u00f2ng" },
  rooms: { icon: "\u25a4", color: "mint", desc: "Qu\u1ea3n l\u00fd ph\u00f2ng, lo\u1ea1i ph\u00f2ng v\u00e0 s\u1ee9c ch\u1ee9a" },
  motorbikes: { icon: "\u2668", color: "mint", desc: "Danh s\u00e1ch v\u00e0 qu\u1ea3n l\u00fd xe m\u00e1y" },
  bikeTypes: { icon: "\u2261", color: "mint", desc: "C\u1ea5u h\u00ecnh lo\u1ea1i xe v\u00e0 l\u1ecbch b\u1ea3o tr\u00ec" },
  rentals: { icon: "\u25c6", color: "gold", desc: "Qu\u1ea3n l\u00fd thu\u00ea, tr\u1ea3 xe v\u00e0 h\u1ee3p \u0111\u1ed3ng" },
  calendar: { icon: "\u25a6", color: "teal", desc: "L\u1ecbch thu\u00ea xe theo ng\u00e0y v\u00e0 tr\u1ea1ng th\u00e1i" },
  bikeMaintenance: { icon: "\u2692", color: "red", desc: "Qu\u1ea3n l\u00fd s\u1eeda ch\u1eefa v\u00e0 chi ph\u00ed xe" },
  equipment: { icon: "\u25a3", color: "purple", desc: "Danh s\u00e1ch thi\u1ebft b\u1ecb kh\u00e1ch s\u1ea1n" },
  equipmentTypes: { icon: "\u2261", color: "purple", desc: "C\u1ea5u h\u00ecnh lo\u1ea1i thi\u1ebft b\u1ecb v\u00e0 b\u1ea3o tr\u00ec" },
  equipmentMaintenance: { icon: "\u2723", color: "orange", desc: "Qu\u1ea3n l\u00fd s\u1eeda ch\u1eefa thi\u1ebft b\u1ecb" },
  maintenanceCalendar: { icon: "\u25f4", color: "blue", desc: "L\u1ecbch b\u1ea3o tr\u00ec \u0111\u1ecbnh k\u1ef3 thi\u1ebft b\u1ecb, xe" },
  owners: { icon: "\u25cf", color: "green", desc: "Qu\u1ea3n l\u00fd ch\u1ee7 s\u1edf h\u1eefu v\u00e0 xe theo ch\u1ee7" },
  finance: { icon: "$", color: "gold", desc: "Theo d\u00f5i doanh thu v\u00e0 chi ph\u00ed" },
  reports: { icon: "\u25a5", color: "blue", desc: "B\u00e1o c\u00e1o v\u00e0 th\u1ed1ng k\u00ea chi ti\u1ebft" },
  notifications: { icon: "\u25cf", color: "pink", desc: "Th\u00f4ng b\u00e1o h\u1ec7 th\u1ed1ng v\u00e0 nh\u1eafc vi\u1ec7c" },
  hr: { icon: "\u25ce", color: "green", desc: "H\u1ed3 s\u01a1 nh\u00e2n s\u1ef1, nh\u00e2n vi\u00ean \u0111ang l\u00e0m v\u00e0 \u1ee9ng vi\u00ean" },
  users: { icon: "\u25ce", color: "green", desc: "Qu\u1ea3n l\u00fd t\u00e0i kho\u1ea3n nh\u00e2n vi\u00ean" },
  audit: { icon: "\u2261", color: "purple", desc: "Nh\u1eadt k\u00fd thao t\u00e1c h\u1ec7 th\u1ed1ng" },
  settings: { icon: "\u2699", color: "orange", desc: "C\u1ea5u h\u00ecnh h\u1ec7 th\u1ed1ng" }
};

const navSvgIcons = {
  dashboard: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19h16" /><path d="M6 17V9h4v8" /><path d="M14 17V5h4v12" /><path d="M6 13l4-4 3 3 5-6" /></svg>`,
  bookingTimeline: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M4 10h16" /><path d="M8 14h8" /><path d="M8 17h5" /></svg>`,
  hotels: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V6l7-3 7 3v14" /><path d="M9 20v-5h6v5" /><path d="M9 8h.01" /><path d="M12 8h.01" /><path d="M15 8h.01" /><path d="M9 12h.01" /><path d="M12 12h.01" /><path d="M15 12h.01" /></svg>`,
  rooms: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" /><path d="M4 14h16" /><path d="M7 14v-3h5v3" /><path d="M14 14v-3h3" /></svg>`,
  motorbikes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16a3 3 0 1 0 0 .1" /><path d="M19 16a3 3 0 1 0 0 .1" /><path d="M7 16h4l3-5h2l3 5" /><path d="M10 9h3" /><path d="M14 7h3" /><path d="M16 7l2-2" /></svg>`,
  bikeTypes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 16h14l-1.7-5.2A3 3 0 0 0 14.5 9h-5A3 3 0 0 0 6.7 10.8L5 16Z" /><path d="M7 16v2" /><path d="M17 16v2" /><path d="M7.5 13h9" /></svg>`,
  rentals: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12 12 20 4 12V4h8l8 8Z" /><path d="M8.5 8.5h.01" /></svg>`,
  calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M4 10h16" /><path d="M8 14h2" /><path d="M14 14h2" /></svg>`,
  bikeMaintenance: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0 4.8 4.8l-7.8 7.8a2.5 2.5 0 0 1-3.5-3.5l7.8-7.8Z" /><path d="M5 6l4 4" /><path d="M6 5 4 7" /></svg>`,
  equipment: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="7" width="14" height="12" rx="2" /><path d="M9 7V5h6v2" /><path d="M5 12h14" /></svg>`,
  equipmentTypes: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4" /><path d="m4 16 8 4 8-4" /></svg>`,
  equipmentMaintenance: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="5" height="5" rx="1" /><rect x="15" y="4" width="5" height="5" rx="1" /><rect x="4" y="15" width="5" height="5" rx="1" /><rect x="15" y="15" width="5" height="5" rx="1" /><path d="M9 6.5h6" /><path d="M6.5 9v6" /><path d="M17.5 9v6" /><path d="M9 17.5h6" /></svg>`,
  maintenanceCalendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-5" /></svg>`,
  owners: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>`,
  finance: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" /><path d="M12 7v10" /><path d="M15 9.5c-.8-.7-2.1-1-3-1-1.5 0-2.5.7-2.5 1.8 0 2.6 5 1.3 5 4 0 1.1-1 2-2.7 2-1.2 0-2.4-.4-3.2-1.1" /></svg>`,
  reports: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 17v-5" /><path d="M12 17V8" /><path d="M16 17v-7" /></svg>`,
  notifications: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 1 0-12 0c0 7-2 7-2 9h16c0-2-2-2-2-9" /><path d="M10 21h4" /></svg>`,
  hr: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 19a4 4 0 0 0-8 0" /><circle cx="12" cy="9" r="3" /><path d="M22 19a4 4 0 0 0-5-3.8" /><path d="M17 6.3a3 3 0 0 1 0 5.4" /><path d="M2 19a4 4 0 0 1 5-3.8" /><path d="M7 6.3a3 3 0 0 0 0 5.4" /></svg>`,
  users: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M9 4V2h6v2" /><circle cx="12" cy="11" r="2" /><path d="M8.5 17a3.5 3.5 0 0 1 7 0" /></svg>`,
  audit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4l2-6 4 12 2-6h6" /></svg>`,
  settings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" /><path d="M12 2v3" /><path d="M12 19v3" /><path d="m4.9 4.9 2.1 2.1" /><path d="m17 17 2.1 2.1" /><path d="M2 12h3" /><path d="M19 12h3" /><path d="m4.9 19.1 2.1-2.1" /><path d="m17 7 2.1-2.1" /></svg>`
};

const state = {
  user: null,
  view: "dashboard",
  query: "",
  filter: "all",
  modal: null,
  bikeImageDraft: null,
  mobileNav: false,
  bikeFilters: {
    owner: "all",
    type: "all",
    sort: "code-asc"
  },
  panelPages: {
    bikeTickets: 1,
    equipmentTickets: 1,
    oilAlerts: 1,
    bikeTicketHistory: 1,
    equipmentTicketHistory: 1,
    bookingHistory: 1
  },
  rentalDate: "",
  attendance: {
    period: "month",
    date: todayISO(),
    month: todayISO().slice(0, 7),
    year: String(new Date().getFullYear()),
    shift: "all"
  },
  bookingTimeline: {
    hotel: "all",
    period: "month",
    month: todayISO().slice(0, 7),
    date: todayISO()
  },
  reportMonth: todayISO().slice(0, 7),
  auditFilters: {
    query: "",
    user: "all",
    role: "all",
    action: "all",
    date: ""
  }
};

const bikeStatuses = ["Có sẵn", "Đã đặt", "Đang thuê", "Quá hạn", "Chờ kiểm tra", "Hư hỏng", "Đang sửa", "Chờ phụ tùng", "Ngừng sử dụng"];
const rentalStatuses = ["Đã đặt", "Đang thuê", "Quá hạn", "Đã trả", "Chưa thanh toán đủ", "Đã hủy"];
const ticketStatuses = ["Mới tạo", "Đang kiểm tra", "Chờ duyệt chi phí", "Đang sửa", "Chờ phụ tùng", "Chờ nghiệm thu", "Hoàn thành", "Đã hủy"];
const BIKE_IMAGE_LIMIT = 10;
const BIKE_IMAGE_MAX_SIZE = 520;
const BIKE_IMAGE_QUALITY = 0.38;
const BIKE_IMAGE_MAX_BYTES = 45000;

function todayISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function nowLocal() {
  return new Date().toISOString();
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false });
}

function money(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

function nextCode(prefix, rows = []) {
  const max = rows.reduce((largest, row) => {
    const match = String(row.code || "").match(/(\d+)$/);
    return Math.max(largest, match ? Number(match[1]) : 0);
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, "0")}`;
}

function can(key) {
  if (!state.user) return false;
  if (state.user.role === "admin") return true;
  if (key === "all") return true;
  const effective = Array.isArray(state.user.permissions) ? state.user.permissions : permissions[state.user.role] || [];
  return effective.includes(key);
}

function canAny(keys) {
  return keys.some(can);
}

function isSuperAdmin() {
  return state.user?.role === "admin";
}


function defaultHotelCatalog() {
  return [
    { id: "h1", code: "HT-001", name: "COCO BAY RESORT", rooms: 28, tone: "green", status: "\u0110ang ho\u1ea1t \u0111\u1ed9ng", phone: "0901 234 567", address: "H\u00f2n S\u01a1n, Ki\u00ean H\u1ea3i, Ki\u00ean Giang", manager: "Ch\u1ee7 Coco Bay", weekdayPrice: 750000, weekendPrice: 850000, holidayPrice: 950000, note: "Kh\u00e1ch s\u1ea1n ch\u00ednh" },
    { id: "h2", code: "HT-002", name: "KH\u00c1CH S\u1ea0N A", rooms: 18, tone: "blue", status: "\u0110ang ho\u1ea1t \u0111\u1ed9ng", phone: "0902 234 567", address: "H\u00f2n S\u01a1n", manager: "L\u1ec5 t\u00e2n", weekdayPrice: 650000, weekendPrice: 780000, holidayPrice: 900000, note: "Chi nh\u00e1nh A" },
    { id: "h3", code: "HT-003", name: "KH\u00c1CH S\u1ea0N B", rooms: 25, tone: "purple", status: "\u0110ang ho\u1ea1t \u0111\u1ed9ng", phone: "0903 234 567", address: "H\u00f2n S\u01a1n", manager: "L\u1ec5 t\u00e2n", weekdayPrice: 700000, weekendPrice: 820000, holidayPrice: 980000, note: "Chi nh\u00e1nh B" },
    { id: "h4", code: "HT-004", name: "KH\u00c1CH S\u1ea0N C", rooms: 15, tone: "orange", status: "\u0110ang ho\u1ea1t \u0111\u1ed9ng", phone: "0904 234 567", address: "H\u00f2n S\u01a1n", manager: "L\u1ec5 t\u00e2n", weekdayPrice: 600000, weekendPrice: 720000, holidayPrice: 850000, note: "Chi nh\u00e1nh C" }
  ];
}


function defaultRoomCatalog() {
  return [
    ["h1", "101", "Deluxe Ocean View"], ["h1", "102", "Deluxe Ocean View"], ["h1", "103", "Deluxe Ocean View"], ["h1", "104", "Family Suite"], ["h1", "105", "Family Suite"],
    ["h2", "A01", "Superior City View"], ["h2", "A02", "Superior City View"], ["h2", "A03", "Deluxe City View"],
    ["h3", "B01", "Deluxe Sea View"], ["h3", "B02", "Deluxe Sea View"], ["h3", "B03", "Family Room"],
    ["h4", "C01", "Standard"], ["h4", "C02", "Standard"]
  ].map(([hotelId, code, name], index) => ({
    id: `room-${index + 1}`,
    hotelId,
    code,
    name,
    capacity: name.includes("Family") ? 4 : 2,
    floor: String(code).replace(/\D/g, "").slice(0, 1) || "1",
    status: "\u0110ang hi\u1ec3n th\u1ecb",
    hidden: false,
    weekdayPrice: 0,
    weekendPrice: 0,
    holidayPrice: 0,
    note: ""
  }));
}

function seedDb() {
  return emptyDb();
  return {
    hotels: defaultHotelCatalog(),
    rooms: defaultRoomCatalog(),
    users: [
      { id: "u-admin", name: "Chủ Coco Bay", email: "admin@cocobay.vn", password: "123456", role: "admin", permissions: permissions.admin, active: true },
      { id: "u-manager", name: "Quản lý vận hành", email: "manager@cocobay.vn", password: "123456", role: "manager", permissions: permissions.manager, active: true },
      { id: "u-reception", name: "Lễ tân", email: "reception@cocobay.vn", password: "123456", role: "receptionist", permissions: permissions.receptionist, active: true },
      { id: "u-tech", name: "Kỹ thuật", email: "tech@cocobay.vn", password: "123456", role: "technician", permissions: permissions.technician, active: true }
    ],
    hrEmployees: [
      { id: "hr-1", code: "NS-001", name: "Nguyễn Hoài Nam", gender: "Nam", phone: "0901000001", email: "nam@cocobay.vn", position: "Quản lý vận hành", department: "Vận hành", startDate: "2025-01-12", contractType: "Hợp đồng chính thức", salary: 12000000, status: "Đang làm", address: "Hòn Sơn, Kiên Giang", emergencyContact: "Nguyễn Thị Lan - 0909000001", idNumber: "091200001234", note: "Phụ trách ca sáng và điều phối xe." },
      { id: "hr-2", code: "NS-002", name: "Trần Mai Anh", gender: "Nữ", phone: "0901000002", email: "mai.anh@cocobay.vn", position: "Lễ tân", department: "Lễ tân", startDate: "2025-03-01", contractType: "Thử việc", salary: 7500000, status: "Thử việc", address: "Rạch Giá, Kiên Giang", emergencyContact: "Trần Văn Bình - 0909000002", idNumber: "091200005678", note: "Theo dõi đặt xe và nhận trả xe." },
      { id: "hr-3", code: "NS-003", name: "Lê Văn Phúc", gender: "Nam", phone: "0901000003", email: "phuc@cocobay.vn", position: "Kỹ thuật", department: "Bảo trì", startDate: "2024-11-20", contractType: "Hợp đồng chính thức", salary: 9500000, status: "Đang làm", address: "Kiên Hải, Kiên Giang", emergencyContact: "Lê Thị Hạnh - 0909000003", idNumber: "091200009999", note: "Sửa chữa xe và thiết bị khách sạn." }
    ],
    jobApplicants: [
      { id: "cv-1", code: "UV-001", name: "Phạm Minh Tú", gender: "Nam", phone: "0911000001", email: "tu.pham@gmail.com", position: "Kỹ thuật bảo trì", source: "Facebook", applyDate: todayISO(-3), interviewDate: todayISO(2), expectedSalary: 9000000, status: "Phỏng vấn", experience: "2 năm sửa xe máy và điện lạnh cơ bản", note: "Hẹn phỏng vấn buổi sáng." },
      { id: "cv-2", code: "UV-002", name: "Võ Thanh Trúc", gender: "Nữ", phone: "0911000002", email: "truc.vo@gmail.com", position: "Lễ tân", source: "Người quen giới thiệu", applyDate: todayISO(-1), interviewDate: "", expectedSalary: 8000000, status: "Mới", experience: "Từng làm homestay tại Nam Du", note: "Cần gọi xác nhận lịch phỏng vấn." }
    ],
    attendanceShifts: [
      { id: "shift-1", name: "Ca sáng", start: "06:00", end: "14:00", breakMinutes: 30, note: "Vận hành buổi sáng" },
      { id: "shift-2", name: "Ca chiều", start: "14:00", end: "22:00", breakMinutes: 30, note: "Vận hành buổi chiều" },
      { id: "shift-3", name: "Ca hành chính", start: "08:00", end: "17:00", breakMinutes: 60, note: "Khối văn phòng/quản lý" }
    ],
    attendanceRecords: [
      { id: "att-1", employeeId: "hr-1", date: todayISO(), shiftId: "shift-3", checkIn: "08:00", checkOut: "17:10", status: "Đủ công", note: "Hỗ trợ điều phối tour" },
      { id: "att-2", employeeId: "hr-2", date: todayISO(), shiftId: "shift-1", checkIn: "06:12", checkOut: "14:05", status: "Đi trễ", note: "Trễ 12 phút" },
      { id: "att-3", employeeId: "hr-3", date: todayISO(), shiftId: "shift-2", checkIn: "14:00", checkOut: "22:00", status: "Đủ công", note: "Trực kỹ thuật" },
      { id: "att-4", employeeId: "hr-1", date: todayISO(-1), shiftId: "shift-3", checkIn: "08:05", checkOut: "17:00", status: "Đủ công", note: "" },
      { id: "att-5", employeeId: "hr-2", date: todayISO(-1), shiftId: "shift-1", checkIn: "", checkOut: "", status: "Nghỉ phép", note: "Nghỉ có phép" }
    ],
    owners: [
      { id: "o-1", name: "Coco Bay", phone: "0919000001", type: "Khách sạn sở hữu", note: "Đội xe chính" },
      { id: "o-2", name: "Anh Minh", phone: "0919000002", type: "Ký gửi", note: "Chia doanh thu cuối tháng" }
    ],
    bikeTypes: [
      { id: "bt-1", name: "Tay ga", oilChangeIntervalKm: 1500, maintenanceIntervalKm: 3000, checklist: "Thay nhớt, kiểm tra thắng, lốp, đèn, bình điện, vệ sinh lọc gió", note: "Áp dụng Vision, Lead, Air Blade" },
      { id: "bt-2", name: "Xe số", oilChangeIntervalKm: 1200, maintenanceIntervalKm: 2500, checklist: "Thay nhớt, tăng sên, kiểm tra nhông sên dĩa, thắng, bugi", note: "Áp dụng Wave, Sirius" },
      { id: "bt-3", name: "Xe điện", oilChangeIntervalKm: 0, maintenanceIntervalKm: 2000, checklist: "Kiểm tra pin, sạc, phanh, lốp, đèn, dây điện", note: "Không dùng lịch thay nhớt" }
    ],
    equipmentTypes: [
      { id: "et-1", name: "Máy lạnh", maintenanceIntervalDays: 90, warrantyAlertDays: 30, checklist: "Vệ sinh lưới lọc, dàn lạnh, kiểm tra gas, thoát nước, remote", requiredFields: "HP/BTU, loại gas, phòng, ngày vệ sinh gần nhất", note: "Ưu tiên cao nếu phòng đang có khách" },
      { id: "et-2", name: "Máy giặt", maintenanceIntervalDays: 120, warrantyAlertDays: 30, checklist: "Vệ sinh lồng, kiểm tra motor, dây curoa, bạc đạn, bo mạch", requiredFields: "Khối lượng giặt, loại cửa, khu vực", note: "" },
      { id: "et-3", name: "Tivi", maintenanceIntervalDays: 180, warrantyAlertDays: 30, checklist: "Kiểm tra nguồn, màn hình, remote, cổng HDMI, giá treo", requiredFields: "Kích thước, serial, phòng", note: "" },
      { id: "et-4", name: "Thiết bị khác", maintenanceIntervalDays: 180, warrantyAlertDays: 30, checklist: "Kiểm tra hoạt động, vệ sinh, phụ kiện và an toàn điện", requiredFields: "Vị trí, serial nếu có", note: "" }
    ],
    motorbikes: [
      { id: "b-1", code: "CB-001", plate: "68K1-123.45", name: "Vision Trắng", type: "Tay ga", brand: "Honda", model: "Vision", color: "Trắng", ownerId: "o-1", ownership: "Khách sạn sở hữu", weekdayPrice: 180000, weekendPrice: 220000, holidayPrice: 260000, odometer: 12450, fuel: "80%", lastMaintenance: todayISO(-35), nextMaintenance: todayISO(10), lastOilChangeDate: todayISO(-28), lastOilChangeKm: 11200, oilChangeIntervalKm: 1500, lastMaintenanceKm: 11000, maintenanceIntervalKm: 3000, status: "Có sẵn", notes: "Máy êm, cốp rộng", images: [] },
      { id: "b-2", code: "CB-002", plate: "68K1-234.56", name: "Air Blade Đen", type: "Tay ga", brand: "Honda", model: "Air Blade", color: "Đen", ownerId: "o-1", ownership: "Khách sạn sở hữu", weekdayPrice: 220000, weekendPrice: 260000, holidayPrice: 300000, odometer: 18300, fuel: "60%", lastMaintenance: todayISO(-60), nextMaintenance: todayISO(-2), lastOilChangeDate: todayISO(-42), lastOilChangeKm: 16800, oilChangeIntervalKm: 1500, lastMaintenanceKm: 15300, maintenanceIntervalKm: 3000, status: "Đang thuê", notes: "", images: [] },
      { id: "b-3", code: "CB-003", plate: "68K1-345.67", name: "Wave Alpha", type: "Xe số", brand: "Honda", model: "Wave Alpha", color: "Xanh", ownerId: "o-2", ownership: "Ký gửi", weekdayPrice: 150000, weekendPrice: 180000, holidayPrice: 220000, odometer: 22120, fuel: "40%", lastMaintenance: todayISO(-90), nextMaintenance: todayISO(22), lastOilChangeDate: todayISO(-64), lastOilChangeKm: 20500, oilChangeIntervalKm: 1500, lastMaintenanceKm: 19000, maintenanceIntervalKm: 3000, status: "Hư hỏng", notes: "Khó nổ máy", images: [] },
      { id: "b-4", code: "CB-004", plate: "68K1-456.78", name: "Lead Bạc", type: "Tay ga", brand: "Honda", model: "Lead", color: "Bạc", ownerId: "o-1", ownership: "Khách sạn sở hữu", weekdayPrice: 230000, weekendPrice: 280000, holidayPrice: 320000, odometer: 9200, fuel: "100%", lastMaintenance: todayISO(-20), nextMaintenance: todayISO(40), lastOilChangeDate: todayISO(-18), lastOilChangeKm: 8200, oilChangeIntervalKm: 1500, lastMaintenanceKm: 7000, maintenanceIntervalKm: 3000, status: "Đã đặt", notes: "", images: [] }
    ],
    rentals: [
      { id: "r-1", code: "RT-001", customer: "Nguyễn Hoài Nam", phone: "0901000001", room: "203", bikeId: "b-2", start: `${todayISO(-1)}T09:00`, end: `${todayISO()}T08:00`, price: 220000, surcharge: 0, discount: 0, deposit: 300000, total: 220000, paid: 220000, paymentMethod: "Tiền mặt", kmOut: 18220, fuelOut: "80%", kmIn: "", fuelIn: "", beforePhoto: "", afterPhoto: "", status: "Quá hạn", notes: "Khách hẹn trả buổi sáng" },
      { id: "r-2", code: "RT-002", customer: "Trần Mai Anh", phone: "0901000002", room: "105", bikeId: "b-4", start: `${todayISO()}T15:00`, end: `${todayISO(2)}T10:00`, price: 230000, surcharge: 0, discount: 30000, deposit: 300000, total: 430000, paid: 200000, paymentMethod: "Chuyển khoản", kmOut: "", fuelOut: "", kmIn: "", fuelIn: "", beforePhoto: "", afterPhoto: "", status: "Đã đặt", notes: "" }
    ],
    equipment: [
      { id: "e-1", code: "AC-101", name: "Máy lạnh phòng 101", type: "Máy lạnh", brand: "Daikin", model: "FTKA25", serial: "DK101", power: "1 HP", room: "101", floor: "1", area: "Khu A", purchaseDate: "2024-02-11", installDate: "2024-02-13", supplier: "Điện máy Rạch Giá", price: 8200000, warrantyEnd: todayISO(45), lastMaintenance: todayISO(-70), nextMaintenance: todayISO(3), condition: "Hoạt động", failureCount: 1, repairCost: 450000, photos: [], note: "Phòng đang có khách", extra: "Gas R32" },
      { id: "e-2", code: "AC-203", name: "Máy lạnh phòng 203", type: "Máy lạnh", brand: "Panasonic", model: "PU9", serial: "PN203", power: "1.5 HP", room: "203", floor: "2", area: "Khu A", purchaseDate: "2023-12-01", installDate: "2023-12-03", supplier: "Điện lạnh Sơn Hải", price: 9700000, warrantyEnd: todayISO(330), lastMaintenance: todayISO(-120), nextMaintenance: todayISO(-5), condition: "Đang hư", failureCount: 3, repairCost: 1300000, photos: [], note: "Chảy nước, phòng đang có khách", extra: "Gas R32" },
      { id: "e-3", code: "WM-01", name: "Máy giặt khu sau", type: "Máy giặt", brand: "LG", model: "T2310", serial: "LG01", power: "10kg", room: "Giặt ủi", floor: "Tầng trệt", area: "Hậu cần", purchaseDate: "2023-04-08", installDate: "2023-04-08", supplier: "LG Kiên Giang", price: 7600000, warrantyEnd: todayISO(-20), lastMaintenance: todayISO(-30), nextMaintenance: todayISO(30), condition: "Hoạt động", failureCount: 0, repairCost: 0, photos: [], note: "", extra: "Cửa trên" }
    ],
    tickets: [
      { id: "t-1", code: "MT-001", assetType: "Xe máy", assetId: "b-3", issue: "Khó nổ máy, nghi bugi hoặc bình yếu", priority: "Cao", beforePhoto: "", reporterId: "u-reception", assigneeId: "u-tech", foundDate: todayISO(-1), dueDate: todayISO(1), cause: "", solution: "", parts: "Bugi dự kiến", estimatedCost: 250000, actualCost: 0, afterPhoto: "", approverId: "", status: "Đang kiểm tra", notes: "" },
      { id: "t-2", code: "MT-002", assetType: "Thiết bị", assetId: "e-2", issue: "Máy lạnh chảy nước trong phòng đang có khách", priority: "Khẩn cấp", beforePhoto: "", reporterId: "u-manager", assigneeId: "u-tech", foundDate: todayISO(-2), dueDate: todayISO(-1), cause: "Tắc đường thoát nước", solution: "Vệ sinh dàn lạnh và thông ống", parts: "", estimatedCost: 350000, actualCost: 380000, afterPhoto: "", approverId: "", status: "Chờ nghiệm thu", notes: "" }
    ],
    notifications: [
      { id: "n-1", title: "Xe CB-002 quá hạn trả", message: "Phiếu RT-001 đã quá giờ trả xe.", type: "Quá hạn", read: false, createdAt: nowLocal() },
      { id: "n-2", title: "Máy lạnh phòng 203 cần xử lý", message: "Phòng đang có khách, ưu tiên cao.", type: "Thiết bị", read: false, createdAt: nowLocal() }
    ],
    recoveryRequests: [],
    auditLogs: [],
    settings: { currency: "VNĐ", timezone: "Asia/Ho_Chi_Minh", dateFormat: "DD/MM/YYYY", seeded: true }
  };
}

function emptyDb() {
  return {
    hotels: [],
    rooms: [],
    users: [
      { id: "u-admin", name: "Chủ Coco Bay", email: "admin@cocobay.vn", password: "123456", role: "admin", permissions: permissions.admin, active: true, lastLoginAt: "" }
    ],
    hrEmployees: [],
    jobApplicants: [],
    attendanceShifts: [],
    attendanceRecords: [],
    owners: [],
    bikeTypes: [],
    equipmentTypes: [],
    motorbikes: [],
    rentals: [],
    equipment: [],
    tickets: [],
    notifications: [],
    recoveryRequests: [],
    auditLogs: [],
    hotelBookings: [],
    settings: { currency: "VNĐ", timezone: "Asia/Ho_Chi_Minh", dateFormat: "DD/MM/YYYY", seeded: false, deletedSeedBookings: [], bookingPermissionsMigrated: true }
  };
}

function getDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const db = emptyDb();
    safeLocalSet(DB_KEY, JSON.stringify(db));
    return db;
  }
  const db = JSON.parse(raw);
  const migrated = migrateDb(db);
  if (migrated) setDb(db);
  return db;
}

function isStorageQuotaError(error) {
  return error && (
    error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    error.code === 22 ||
    error.code === 1014 ||
    String(error.message || "").toLowerCase().includes("quota")
  );
}

function safeLocalSet(key, value, options = {}) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (isStorageQuotaError(error)) {
      if (!options.silent) {
        showToast("Bộ nhớ trình duyệt đã đầy. Dữ liệu vẫn lưu trên MySQL, nhưng máy này không lưu được bản cache.");
      }
      return false;
    }
    throw error;
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || payload.error || "API request failed");
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function loadRemoteSession() {
  try {
    const health = await apiRequest("/health");
    apiState.enabled = health.mode === "mysql";
    if (!apiState.enabled) {
      apiState.lastError = "Website chưa kết nối được MySQL.";
      return false;
    }
  } catch {
    apiState.enabled = false;
    apiState.lastError = "Không kết nối được API/MySQL.";
    return false;
  }
  try {
    const payload = await apiRequest("/me");
    if (payload.db) safeLocalSet(DB_KEY, JSON.stringify(payload.db), { silent: true });
    if (Number.isInteger(Number(payload.version))) apiState.version = Number(payload.version);
    if (payload.user) {
      state.user = { ...payload.user };
      safeLocalSet(SESSION_KEY, JSON.stringify({ userId: payload.user.id }), { silent: true });
    }
    return true;
  } catch (error) {
    if (error.status !== 401) apiState.lastError = error.message;
    state.user = null;
    localStorage.removeItem(SESSION_KEY);
    return false;
  }
}

function queueRemoteSave(db) {
  if (!apiState.enabled || !state.user) return;
  window.clearTimeout(apiState.saveTimer);
  apiState.pendingDb = compactDbForRemoteSave(db);
  apiState.saveTimer = window.setTimeout(flushRemoteSave, 350);
}

async function flushRemoteSave() {
  if (apiState.saving || !apiState.pendingDb || !apiState.enabled || !state.user) return;
  apiState.saving = true;
  const db = apiState.pendingDb;
  apiState.pendingDb = null;
  try {
    const payload = await apiRequest("/data", {
      method: "PUT",
      body: JSON.stringify({ db, baseVersion: apiState.version })
    });
    if (Number.isInteger(Number(payload.version))) apiState.version = Number(payload.version);
    apiState.lastError = "";
  } catch (error) {
    apiState.lastError = error.message;
    if (error.status === 409) {
      apiState.pendingDb = null;
      await refreshRemoteDb({ force: true });
      showToast("Dữ liệu đã được cập nhật từ thiết bị khác. Hệ thống vừa tải lại bản mới từ MySQL.");
    } else {
      apiState.pendingDb = db;
      showToast(`Chưa đồng bộ được dữ liệu lên MySQL.${error.status === 413 ? " Dữ liệu hình ảnh đang quá lớn." : ""} Hệ thống sẽ thử lại.`);
    }
  } finally {
    apiState.saving = false;
    if (apiState.pendingDb) {
      window.clearTimeout(apiState.saveTimer);
      apiState.saveTimer = window.setTimeout(flushRemoteSave, 800);
    }
  }
}

async function refreshRemoteDb(options = {}) {
  if (!apiState.enabled || !state.user || apiState.saving || apiState.pendingDb) return false;
  if (!options.force && document.querySelector(".modal-backdrop")) return false;
  try {
    const payload = await apiRequest("/data");
    const remoteVersion = Number(payload.version);
    if (!payload.db || (!options.force && Number.isInteger(remoteVersion) && remoteVersion <= Number(apiState.version || 0))) {
      return false;
    }
    safeLocalSet(DB_KEY, JSON.stringify(payload.db), { silent: true });
    if (Number.isInteger(remoteVersion)) apiState.version = remoteVersion;
    const currentUser = (payload.db.users || []).find((user) => user.id === state.user?.id && user.active);
    if (currentUser) state.user = { ...currentUser };
    apiState.lastError = "";
    render();
    return true;
  } catch (error) {
    if (error.status !== 401) apiState.lastError = error.message;
    return false;
  }
}

function bindRemoteRefresh() {
  if (apiState.refreshBound) return;
  apiState.refreshBound = true;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshRemoteDb();
  });
  window.addEventListener("focus", () => refreshRemoteDb());
  window.setInterval(() => refreshRemoteDb(), 30000);
}

async function syncDeletedBooking(id) {
  if (!apiState.enabled || !state.user) return;
  try {
    const payload = await apiRequest(`/bookings/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (Number.isInteger(Number(payload.version))) apiState.version = Number(payload.version);
    apiState.lastError = "";
    showToast("Đã xóa đặt phòng và đồng bộ MySQL.");
  } catch (error) {
    apiState.lastError = error.message;
    queueRemoteSave(getDb());
    showToast("Đã xóa trên máy này. Chưa đồng bộ được MySQL, hệ thống sẽ thử lại bằng bản local.");
  }
}

function repairTextEncoding(value) {
  const cp1252 = {
    "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86, "‡": 0x87, "ˆ": 0x88,
    "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c, "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93,
    "”": 0x94, "•": 0x95, "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b,
    "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f
  };
  const markers = /[ÃÂÄÆ€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ\u0080-\u009f]/;
  const decodeOnce = (text) => {
    if (!markers.test(text)) return text;
    const bytes = [];
    for (const char of text) {
      const code = char.charCodeAt(0);
      if (cp1252[char] !== undefined) bytes.push(cp1252[char]);
      else if (code <= 255) bytes.push(code);
      else return text;
    }
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
    } catch {
      return text;
    }
  };
  let current = String(value);
  for (let i = 0; i < 4; i += 1) {
    const next = decodeOnce(current);
    if (next === current) break;
    current = next;
  }
  return current
    .replaceAll("Không", "Không")
    .replaceAll("Chưa", "Chưa")
    .replaceAll("Sửa", "Sửa")
    .replaceAll("Tạo", "Tạo")
    .replaceAll("Đã", "Đã");
}

function repairDbTextEncoding(value) {
  let changed = false;
  const visit = (item) => {
    if (typeof item === "string") {
      const fixed = repairTextEncoding(item);
      if (fixed !== item) changed = true;
      return fixed;
    }
    if (Array.isArray(item)) return item.map(visit);
    if (item && typeof item === "object") {
      Object.keys(item).forEach((key) => {
        item[key] = visit(item[key]);
      });
    }
    return item;
  };
  visit(value);
  return changed;
}

function migrateDb(db) {
  let changed = false;
  if (repairDbTextEncoding(db)) changed = true;
  if (!Array.isArray(db.hotels)) {
    db.hotels = [];
    changed = true;
  }
  db.hotels.forEach((hotel, index) => {
    const base = {};
    const hasBrokenText = [hotel.name, hotel.address, hotel.status, hotel.manager, hotel.note].some((value) => String(value || "").includes("?"));
    if (hasBrokenText && base.id === hotel.id) {
      Object.assign(hotel, {
        name: base.name,
        address: base.address,
        status: base.status,
        manager: base.manager,
        note: base.note,
        phone: hotel.phone || base.phone,
        tone: hotel.tone || base.tone
      });
      changed = true;
    }
    if (!hotel.code) { hotel.code = base.code || nextCode("HT", db.hotels); changed = true; }
    if (!hotel.status) { hotel.status = "\u0110ang ho\u1ea1t \u0111\u1ed9ng"; changed = true; }
    if (hotel.weekdayPrice === undefined) { hotel.weekdayPrice = base.weekdayPrice || 0; changed = true; }
    if (hotel.weekendPrice === undefined) { hotel.weekendPrice = base.weekendPrice || 0; changed = true; }
    if (hotel.holidayPrice === undefined) { hotel.holidayPrice = base.holidayPrice || 0; changed = true; }
    if (!hotel.tone) { hotel.tone = base.tone || "green"; changed = true; }
    if (hotel.rooms === undefined) { hotel.rooms = base.rooms || 0; changed = true; }
  });
  if (!Array.isArray(db.rooms)) {
    db.rooms = [];
    changed = true;
  }
  db.rooms.forEach((room, index) => {
    const base = {};
    if (!room.id) { room.id = uid("ROOM"); changed = true; }
    if (!room.hotelId) { room.hotelId = base.hotelId || db.hotels[0]?.id || ""; changed = true; }
    if (!room.code) { room.code = base.code || nextCode("P", db.rooms); changed = true; }
    if (!room.name) { room.name = base.name || "Standard"; changed = true; }
    if (room.capacity === undefined) { room.capacity = base.capacity || 2; changed = true; }
    if (!room.status) { room.status = room.hidden ? "\u0110ang \u1ea9n" : "\u0110ang hi\u1ec3n th\u1ecb"; changed = true; }
    if (room.hidden === undefined) { room.hidden = room.status === "\u0110ang \u1ea9n"; changed = true; }
    if (room.weekdayPrice === undefined) { room.weekdayPrice = base.weekdayPrice || 0; changed = true; }
    if (room.weekendPrice === undefined) { room.weekendPrice = base.weekendPrice || 0; changed = true; }
    if (room.holidayPrice === undefined) { room.holidayPrice = base.holidayPrice || 0; changed = true; }
  });
  if (!Array.isArray(db.hotelBookings)) {
    db.hotelBookings = [];
    changed = true;
  }
  if (!Array.isArray(db.recoveryRequests)) {
    db.recoveryRequests = [];
    changed = true;
  }
  if (!Array.isArray(db.owners)) {
    db.owners = [];
    changed = true;
  }
  db.owners.forEach((owner) => {
    if (owner.hidden === undefined) {
      owner.hidden = false;
      changed = true;
    }
  });
  if (!Array.isArray(db.hrEmployees)) {
    db.hrEmployees = [];
    changed = true;
  }
  if (!Array.isArray(db.jobApplicants)) {
    db.jobApplicants = [];
    changed = true;
  }
  if (!Array.isArray(db.attendanceShifts)) {
    db.attendanceShifts = [];
    changed = true;
  }
  if (!Array.isArray(db.attendanceRecords)) {
    db.attendanceRecords = [];
    changed = true;
  }
  db.users?.forEach((user) => {
    if (!Array.isArray(user.permissions)) {
      user.permissions = permissions[user.role] || [];
      changed = true;
    }
    if (user.active === undefined) {
      user.active = true;
      changed = true;
    }
    if (user.lastLoginAt === undefined) {
      user.lastLoginAt = "";
      changed = true;
    }
  });
  if (!db.settings?.bookingPermissionsMigrated) {
    db.users?.forEach((user) => {
      const defaults = permissions[user.role] || [];
      if (!Array.isArray(user.permissions)) user.permissions = [];
      defaults.filter((permission) => permission.startsWith("booking_")).forEach((permission) => {
        if (!user.permissions.includes(permission)) {
          user.permissions.push(permission);
          changed = true;
        }
      });
    });
    db.settings = { ...(db.settings || {}), bookingPermissionsMigrated: true };
    changed = true;
  }
  db.settings = db.settings || {};
  if (!Array.isArray(db.settings.deletedSeedBookings)) {
    db.settings.deletedSeedBookings = [];
    changed = true;
  }
  if (!Array.isArray(db.bikeTypes)) {
    db.bikeTypes = [];
    changed = true;
  }
  if (!Array.isArray(db.equipmentTypes)) {
    db.equipmentTypes = [];
    changed = true;
  }
  db.motorbikes?.forEach((bike) => {
    if (!Array.isArray(bike.images)) {
      bike.images = [];
      changed = true;
    }
    if (bike.parking !== undefined) {
      delete bike.parking;
      changed = true;
    }
    if (bike.lastOilChangeKm === undefined) {
      bike.lastOilChangeKm = Math.max(0, Number(bike.odometer || 0) - 1200);
      changed = true;
    }
    if (bike.lastOilChangeDate === undefined) {
      bike.lastOilChangeDate = bike.lastMaintenance || todayISO();
      changed = true;
    }
    if (bike.oilAlertEnabled === undefined) {
      bike.oilAlertEnabled = true;
      changed = true;
    }
    if (bike.oilAlertHandled === undefined) {
      bike.oilAlertHandled = false;
      changed = true;
    }
    if (bike.oilChangeIntervalKm === undefined) {
      bike.oilChangeIntervalKm = 1500;
      changed = true;
    }
    if (bike.lastMaintenanceKm === undefined) {
      bike.lastMaintenanceKm = Math.max(0, Number(bike.odometer || 0) - 2500);
      changed = true;
    }
    if (bike.maintenanceIntervalKm === undefined) {
      bike.maintenanceIntervalKm = 3000;
      changed = true;
    }
  });
  db.equipment?.forEach((item) => {
    if (!item.typeId) {
      item.typeId = db.equipmentTypes.find((type) => type.name === item.type)?.id || db.equipmentTypes[0]?.id || "";
      changed = true;
    }
    if (item.maintenanceAlertEnabled === undefined) {
      item.maintenanceAlertEnabled = true;
      changed = true;
    }
    if (item.maintenanceAlertHandled === undefined) {
      item.maintenanceAlertHandled = false;
      changed = true;
    }
  });
  return changed;
}

function setDb(db, options = {}) {
  const payload = JSON.stringify(db);
  try {
    cleanupTemporaryStorage();
    localStorage.setItem(DB_KEY, payload);
    if (!options.skipRemote) queueRemoteSave(db);
  } catch (error) {
    const compactDb = compactDbForLocalStorage(db);
    try {
      cleanupTemporaryStorage();
      localStorage.setItem(DB_KEY, JSON.stringify(compactDb));
      if (!options.skipRemote) queueRemoteSave(db);
      showToast("Đã lưu dữ liệu sau khi dọn bớt nhật ký cũ để còn chỗ cho hình ảnh.");
      return;
    } catch (compactError) {
      // Continue to the remote/local error handling below.
    }
    if (apiState.enabled) {
      if (!options.skipRemote) queueRemoteSave(db);
      showToast("Dữ liệu ảnh đã lưu lên MySQL. Bộ nhớ trình duyệt đã đầy nên cache local có thể không cập nhật.");
      return;
    }
    showToast("Không lưu được dữ liệu. Ảnh đã được nén, nhưng bộ nhớ trình duyệt vẫn đầy. Hãy xóa bớt ảnh cũ hoặc dùng MySQL backend.");
    throw error;
  }
}

function cleanupTemporaryStorage() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith(`${DB_KEY}.before-import-`) || key.startsWith("coco-bay-temp-"))
    .forEach((key) => localStorage.removeItem(key));
}

function compactDbForLocalStorage(db) {
  const compact = JSON.parse(JSON.stringify(db));
  compact.auditLogs = (compact.auditLogs || []).slice(0, 80);
  compact.notifications = (compact.notifications || []).slice(0, 80);
  compact.recoveryRequests = (compact.recoveryRequests || []).slice(0, 20);
  return compact;
}

function compactDbForRemoteSave(db) {
  const compact = compactDbForLocalStorage(db);
  compact.auditLogs = (compact.auditLogs || []).slice(0, 200);
  compact.notifications = (compact.notifications || []).slice(0, 150);
  return compact;
}

function mutateDb(mutator, action = "Cập nhật dữ liệu", options = {}) {
  const db = getDb();
  const before = JSON.parse(JSON.stringify(db));
  const result = mutator(db);
  db.auditLogs.unshift({
    id: uid("LOG"),
    user: state.user?.name || "Hệ thống",
    role: state.user ? roles[state.user.role] : "System",
    action,
    record: result?.record || "",
    before: result?.before || "",
    after: result?.after || "",
    createdAt: nowLocal()
  });
  setDb(db, options);
  syncStatuses();
  render();
}

function syncStatuses() {
  const db = getDb();
  const now = new Date();
  let changed = false;
  db.rentals.forEach((r) => {
    if (["Đang thuê", "Đã đặt"].includes(r.status) && new Date(r.end) < now) {
      r.status = "Quá hạn";
      const bike = db.motorbikes.find((b) => b.id === r.bikeId);
      if (bike && bike.status !== "Hư hỏng" && bike.status !== "Đang sửa") bike.status = "Quá hạn";
      if (!db.notifications.some((n) => n.title.includes(r.code))) {
        db.notifications.unshift({ id: uid("N"), title: `Phiếu ${r.code} quá hạn`, message: `${r.customer} chưa trả xe đúng giờ.`, type: "Quá hạn", read: false, createdAt: nowLocal() });
      }
      changed = true;
    }
  });
  if (changed) setDb(db);
}

function showToast(text) {
  const el = document.getElementById("toast");
  el.textContent = text;
  el.className = "toast show";
  window.setTimeout(() => {
    el.className = "toast";
  }, 2400);
}

function statusClass(status) {
  if (["Hư hỏng", "Quá hạn", "Khẩn cấp", "Đã hủy", "Đang hư", "Nghỉ việc", "Không đạt", "Vắng"].includes(status)) return "danger";
  if (["Đang sửa", "Chờ phụ tùng", "Chờ nghiệm thu", "Đã đặt", "Chờ duyệt chi phí", "Sắp đến hạn", "Thử việc", "Mới", "Phỏng vấn", "Đi trễ", "Nửa ngày", "Nghỉ phép"].includes(status)) return "warning";
  if (["Có sẵn", "Hoàn thành", "Đã trả", "Hoạt động", "Đang làm", "Đạt", "Đã tuyển", "Đủ công", "TTăng ca"].includes(status)) return "success";
  return "muted";
}

async function appInit() {
  bindRemoteRefresh();
  if (isProductionHost()) {
    await loadRemoteSession();
    if (!apiState.enabled) {
      state.user = null;
      localStorage.removeItem(SESSION_KEY);
      render();
      return;
    }
    syncStatuses();
    render();
    return;
  }
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  if (session && !state.user) {
    state.user = getDb().users.find((u) => u.id === session.userId) || null;
    if (state.user) render();
  }
  await loadRemoteSession();
  syncStatuses();
  if (!apiState.enabled) {
    if (session) state.user = getDb().users.find((u) => u.id === session.userId) || null;
  }
  render();
}

function render() {
  const root = document.getElementById("app");
  root.className = "";
  if (!state.user) {
    root.innerHTML = loginView();
    bindLogin();
    return;
  }
  const visibleMenu = menu.filter((item) => can(item[2]));
  if (!visibleMenu.some(([key]) => key === state.view)) state.view = "dashboard";
  root.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar ${state.mobileNav ? "open" : ""}">
        <div class="brand">
          <img class="brand-logo" src="assets/coco-bay-logo.jpg" alt="COCO BAY Hòn Sơn">
          <strong>COCO BAY</strong>
          <span>Internal Management</span>
        </div>
        <nav class="nav">
          ${renderNav()}
        </nav>
        <div class="side-user">
          <span class="side-avatar">${state.user.name.slice(0, 1).toUpperCase()}</span>
          <span><strong>${state.user.name}</strong><small>${roles[state.user.role]}</small></span>
          <button data-action="logout" title="Đăng xuất">⌄</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="topbar-actions">
            <button class="ghost mobile-menu" data-action="toggle-nav">Menu</button>
            <div>
              <strong>${menu.find(([key]) => key === state.view)?.[1] || "Tổng quan"}</strong>
              <div class="hint">${formatDateTime(new Date())} - Asia/Ho_Chi_Minh</div>
            </div>
          </div>
          <div class="topbar-actions">
            <button class="bell" data-view="notifications">Chuông <span class="badge">${unreadCount()}</span></button>
            <span class="hint">${state.user.name} · ${roles[state.user.role]}</span>
            <button class="ghost" data-action="logout">Đăng xuất</button>
          </div>
        </header>
        <section class="content">${viewContent()}</section>
      </main>
      ${state.modal ? modalView() : ""}
    </div>
  `;
  bindApp();
  refreshBookingTodayLine();
}


function refreshBookingTodayLine() {
  const line = document.querySelector(".today-line");
  if (!line) return;
  const days = Array.from({ length: 16 }, (_, index) => 15 + index);
  const left = bookingTodayLineLeft(days);
  if (left === null) {
    line.remove();
    return;
  }
  const now = new Date();
  line.style.left = `${left}%`;
  const label = line.querySelector("span");
  if (label) label.textContent = `H\u00f4m nay ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
}

window.setInterval(refreshBookingTodayLine, 60000);

function menuItem(key) {
  return menu.find(([itemKey]) => itemKey === key);
}

function menuLabel(key) {
  return menuItem(key)?.[1] || key;
}

function menuPermission(key) {
  return menuItem(key)?.[2] || "all";
}

function renderNav() {
  return menuTree.map((item) => renderNavItem(item)).join("");
}

function renderNavItem(item) {
  const children = (item.children || []).filter((child) => can(menuPermission(child.key)));
  const isVisible = can(menuPermission(item.key)) || children.length > 0;
  if (!isVisible) return "";
  const isActive = state.view === item.key;
  const hasActiveChild = children.some((child) => child.key === state.view);
  return `
    <div class="nav-group ${children.length ? "has-children" : ""}">
      ${can(menuPermission(item.key)) ? `<button class="${isActive || hasActiveChild ? "active" : ""}" data-view="${item.key}"><span class="nav-symbol ${navColor(item.key)}">${navIcon(item.key)}</span><span>${menuLabel(item.key)}</span>${children.length ? `<span class="nav-caret">${hasActiveChild ? "▾" : "›"}</span>` : ""}</button>` : ""}
      ${children.length ? `<div class="nav-sub">${children.map((child) => `<button class="${state.view === child.key ? "active" : ""}" data-view="${child.key}"><span class="nav-symbol ${navColor(child.key)}">${navIcon(child.key)}</span><span>${menuLabel(child.key)}</span></button>`).join("")}</div>` : ""}
    </div>
  `;
}

function navIcon(key) {
  return navSvgIcons[key] || menuMeta[key]?.icon || "•";
}

function navColor(key) {
  return menuMeta[key]?.color || "blue";
}

function menuNumber(key, index = 0) {
  const numbers = {
    dashboard: "01", motorbikes: "02", bikeTypes: "02.1", rentals: "02.2", calendar: "02.3", bikeMaintenance: "02.4",
    equipment: "03", equipmentTypes: "03.1", equipmentMaintenance: "03.2", maintenanceCalendar: "04", owners: "05",
    finance: "06", reports: "07", notifications: "08", hr: "09", users: "10", audit: "11", settings: "12"
  };
  return numbers[key] || String(index + 1).padStart(2, "0");
}

function unreadCount() {
  return getDb().notifications.filter((n) => !n.read).length;
}

function loginView() {
  return `
    <section class="login-shell">
      <div class="login-showcase">
        <div class="login-brand">
          <img class="login-mark" src="assets/coco-bay-logo.jpg" alt="COCO BAY Hòn Sơn">
          <strong>HÒN SƠN</strong>
          <h2>INTERNAL<br>MANAGEMENT</h2>
          <span class="login-divider"></span>
          <p>Hệ thống quản lý nội bộ toàn diện</p>
          <small>Chuyên nghiệp · Bảo mật · Hiệu quả</small>
        </div>
        <div class="login-card">
          <div class="login-card-main">
            <img class="login-card-logo" src="assets/coco-bay-logo.jpg" alt="COCO BAY Hòn Sơn">
            <h2>Chào mừng trở lại!</h2>
            <p>Vui lòng đăng nhập để tiếp tục</p>
            <div class="face-login" aria-hidden="true">⌗</div>
            <strong class="quick-login-label">Đăng nhập nhanh</strong>
            <div class="login-or"><span></span>HOẶC<span></span></div>
            <details class="password-login">
              <summary><span>▣</span> Đăng nhập bằng mật khẩu <b>→</b></summary>
              <form id="login-form" class="password-panel">
                <div class="field"><label>Email</label><input name="email" type="email" placeholder="Nhập email đăng nhập" autocomplete="username" required></div>
                <div class="field"><label>Mật khẩu</label><input name="password" type="password" placeholder="Nhập mật khẩu" autocomplete="current-password" required></div>
                <button class="primary" type="submit" style="width:100%">Đăng nhập</button>
              </form>
            </details>
            <details class="login-recovery">
              <summary>Quên mật khẩu hoặc tên đăng nhập?</summary>
              <div class="recover-panel recovery-contact">
                <strong>Liên hệ admin để cấp lại mật khẩu</strong>
                <p>Vui lòng gọi hoặc nhắn Zalo: <a href="tel:0919254025">0919254025</a>.</p>
                <small>Admin sẽ kiểm tra tài khoản và cấp lại mật khẩu mới cho nhân viên.</small>
              </div>
          </details>
          </div>
          <div class="login-card-foot">♢ Bảo mật cấp doanh nghiệp</div>
        </div>
      </div>
    </section>
  `;
}

function bindLogin() {
  document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    data.email = String(data.email || "").trim();
    data.password = String(data.password || "").trim();
    if (apiState.enabled) {
      try {
        const payload = await apiRequest("/login", { method: "POST", body: JSON.stringify(data) });
        if (payload.db) safeLocalSet(DB_KEY, JSON.stringify(payload.db), { silent: true });
        if (Number.isInteger(Number(payload.version))) apiState.version = Number(payload.version);
        state.user = { ...payload.user };
        safeLocalSet(SESSION_KEY, JSON.stringify({ userId: payload.user.id }), { silent: true });
        showToast(`Xin chào ${payload.user.name}`);
        render();
      } catch (error) {
        showToast(error.message || "Email hoặc mật khẩu không đúng.");
      }
      return;
    }
    if (isProductionHost()) {
      showToast("Website chưa kết nối MySQL nên không thể đăng nhập. Vui lòng kiểm tra Hostinger /api/health.");
      return;
    }
    const db = getDb();
    const user = db.users.find((u) => u.email === data.email && u.password === data.password && u.active);
    if (!user) {
      showToast("Email hoặc mật khẩu không đúng. Bản local mặc định: admin@cocobay.vn / 123456.");
      return;
    }
    user.lastLoginAt = nowLocal();
    db.auditLogs.unshift({
      id: uid("LOG"),
      user: user.name,
      role: roles[user.role],
      action: "\u0110\u0103ng nh\u1eadp",
      record: user.email,
      before: "",
      after: `L\u1ea7n \u0111\u0103ng nh\u1eadp g\u1ea7n nh\u1ea5t: ${formatDateTime(user.lastLoginAt)}`,
      createdAt: user.lastLoginAt
    });
    setDb(db);
    state.user = { ...user };
    safeLocalSet(SESSION_KEY, JSON.stringify({ userId: user.id }), { silent: true });
    showToast(`Xin chào ${user.name}`);
    render();
  });
  document.getElementById("recover-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleAccountRecovery(Object.fromEntries(new FormData(event.currentTarget)));
  });
  document.getElementById("reset-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    handlePasswordReset(Object.fromEntries(new FormData(event.currentTarget)));
  });
}

function handleAccountRecovery(data) {
  const identity = String(data.identity || "").trim().toLowerCase();
  const resultEl = document.getElementById("recover-result");
  if (!identity) {
    showToast("Vui lòng nhập email hoặc tên nhân viên.");
    return;
  }
  const db = getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === identity)
    || db.users.find((item) => item.name.toLowerCase().includes(identity) || item.email.toLowerCase().includes(identity));
  if (!user || !user.active) {
    resultEl.textContent = "Nếu tài khoản tồn tại và đang hoạt động, hệ thống sẽ gửi hướng dẫn khôi phục đến email nội bộ.";
    showToast("Đã ghi nhận yêu cầu khôi phục.");
    return;
  }
  const code = uid("RESET").replace(/-/g, "").slice(0, 10);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  db.recoveryRequests.unshift({
    id: uid("REC"),
    userId: user.id,
    email: user.email,
    code,
    used: false,
    requestedAt: nowLocal(),
    expiresAt
  });
  db.auditLogs.unshift({
    id: uid("LOG"),
    user: "Hệ thống",
    role: "System",
    action: "Yêu cầu khôi phục tài khoản",
    record: user.email,
    before: "",
    after: "Đã tạo mã xác minh khôi phục mật khẩu",
    createdAt: nowLocal()
  });
  setDb(db);
  resultEl.innerHTML = `Tên đăng nhập của bạn là <strong>${user.email}</strong>. Mã xác minh demo: <strong>${code}</strong>. Mã có hiệu lực 15 phút.`;
  document.querySelector("#reset-form input[name='email']").value = user.email;
  document.querySelector("#reset-form input[name='code']").value = code;
  showToast("Đã tạo mã khôi phục. Bản demo hiển thị mã ngay trên màn hình.");
}

function handlePasswordReset(data) {
  const email = String(data.email || "").trim().toLowerCase();
  const code = String(data.code || "").trim().toUpperCase();
  const password = String(data.password || "");
  if (!email || !code || password.length < 6) {
    showToast("Nhập email, mã xác minh và mật khẩu mới tối thiểu 6 ký tự.");
    return;
  }
  const db = getDb();
  const user = db.users.find((item) => item.email.toLowerCase() === email && item.active);
  const request = db.recoveryRequests.find((item) => item.email.toLowerCase() === email && item.code === code && !item.used);
  if (!user || !request || new Date(request.expiresAt) < new Date()) {
    showToast("Mã xác minh không hợp lệ hoặc đã hết hạn.");
    return;
  }
  user.password = password;
  request.used = true;
  request.usedAt = nowLocal();
  db.auditLogs.unshift({
    id: uid("LOG"),
    user: "Hệ thống",
    role: "System",
    action: "Đặt lại mật khẩu",
    record: user.email,
    before: "",
    after: "Người dùng đã đặt lại mật khẩu bằng mã xác minh",
    createdAt: nowLocal()
  });
  setDb(db);
  document.querySelector("#login-form input[name='email']").value = user.email;
  document.querySelector("#login-form input[name='password']").value = password;
  document.getElementById("reset-form")?.reset();
  showToast("Đã đặt lại mật khẩu. Bạn có thể đăng nhập bằng mật khẩu mới.");
}

function viewContent() {
  const views = {
    dashboard: dashboardView,
    bookingTimeline: bookingTimelineView,
    hotels: hotelsView,
    rooms: roomsView,
    motorbikes: motorbikesView,
    bikeTypes: bikeTypesView,
    rentals: rentalsView,
    calendar: rentalCalendarView,
    bikeMaintenance: () => ticketsView("Xe máy"),
    equipment: equipmentView,
    equipmentTypes: equipmentTypesView,
    equipmentMaintenance: () => ticketsView("Thiết bị"),
    maintenanceCalendar: maintenanceCalendarView,
    owners: ownersView,
    finance: financeView,
    reports: reportsView,
    notifications: notificationsView,
    hr: hrView,
    users: usersView,
    audit: auditView,
    settings: settingsView
  };
  return (views[state.view] || dashboardView)();
}

function dashboardStats() {
  const db = getDb();
  const bikes = db.motorbikes;
  const equipment = db.equipment;
  const rentals = db.rentals;
  const tickets = db.tickets;
  const month = new Date().toISOString().slice(0, 7);
  const today = todayISO();
  const monthRentals = rentals.filter((r) => r.start.slice(0, 7) === month);
  const todayRentals = rentals.filter((r) => r.start.slice(0, 10) === today);
  const bikeRepair = tickets.filter((t) => t.assetType === "Xe máy").reduce((s, t) => s + Number(t.actualCost || t.estimatedCost || 0), 0);
  const equipmentRepair = tickets.filter((t) => t.assetType === "Thiết bị").reduce((s, t) => s + Number(t.actualCost || t.estimatedCost || 0), 0);
  return {
    bikesTotal: bikes.length,
    bikeStatus: (status) => bikes.filter((b) => b.status === status).length,
    dueMaintenance: bikes.filter((b) => new Date(b.nextMaintenance) <= new Date(todayISO(7)) || isBikeKmDue(b)).length,
    acTotal: equipment.filter((e) => e.type === "Máy lạnh").length,
    acWorking: equipment.filter((e) => e.type === "Máy lạnh" && e.condition === "Hoạt động").length,
    acBroken: equipment.filter((e) => e.type === "Máy lạnh" && e.condition === "Đang hư").length,
    acDueClean: equipment.filter((e) => e.type === "Máy lạnh" && new Date(e.nextMaintenance) <= new Date(todayISO(7))).length,
    washersIssue: equipment.filter((e) => e.type === "Máy giặt" && e.condition !== "Hoạt động").length,
    warrantySoon: equipment.filter((e) => new Date(e.warrantyEnd) <= new Date(todayISO(30))).length,
    todayRevenue: todayRentals.reduce((s, r) => s + Number(r.paid || 0), 0),
    monthRevenue: monthRentals.reduce((s, r) => s + Number(r.paid || 0), 0),
    unpaid: rentals.reduce((s, r) => s + Math.max(0, Number(r.total || 0) - Number(r.paid || 0)), 0),
    bikeRepair,
    equipmentRepair,
    profit: monthRentals.reduce((s, r) => s + Number(r.paid || 0), 0) - bikeRepair - equipmentRepair,
    bikeChart: bikeStatuses.map((status) => ({ label: status, value: bikes.filter((b) => b.status === status).length })).filter((x) => x.value > 0),
    equipmentChart: ["Hoạt động", "Đang hư", "Đang sửa", "Ngừng sử dụng"].map((status) => ({ label: status, value: equipment.filter((e) => e.condition === status).length })).filter((x) => x.value > 0),
    financeChart: [
      { label: "Doanh thu tháng", value: monthRentals.reduce((sum, r) => sum + Number(r.paid || 0), 0), tone: "success" },
      { label: "Chưa thanh toán", value: rentals.reduce((sum, r) => sum + Math.max(0, Number(r.total || 0) - Number(r.paid || 0)), 0), tone: "warning" },
      { label: "Chi phí sửa xe", value: bikeRepair, tone: "danger" },
      { label: "Chi phí thiết bị", value: equipmentRepair, tone: "danger" },
      { label: "Lợi nhuận ước tính", value: monthRentals.reduce((sum, r) => sum + Number(r.paid || 0), 0) - bikeRepair - equipmentRepair, tone: "success" }
    ],
    rentalChart: rentalStatuses.map((status) => ({ label: status, value: rentals.filter((r) => r.status === status).length })).filter((x) => x.value > 0)
  };
}

function recentDayKeys(count = 7) {
  return Array.from({ length: count }, (_, index) => todayISO(index - count + 1));
}

function dayLabel(isoDate) {
  const [year, month, day] = String(isoDate || "").slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return "-";
  return new Date(year, month - 1, day).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

function ticketCost(ticket) {
  return Number(ticket.actualCost || ticket.estimatedCost || 0);
}

function dashboardDailyFinance(days = recentDayKeys(7)) {
  const db = getDb();
  const revenue = days.map((day) => db.rentals
    .filter((rental) => String(rental.start || "").slice(0, 10) === day)
    .reduce((sum, rental) => sum + Number(rental.paid || 0), 0));
  const bikeCost = days.map((day) => db.tickets
    .filter((ticket) => ticket.assetType === "Xe máy" && String(ticket.createdAt || ticket.foundDate || ticket.dueDate || "").slice(0, 10) === day)
    .reduce((sum, ticket) => sum + ticketCost(ticket), 0));
  const equipmentCost = days.map((day) => db.tickets
    .filter((ticket) => ticket.assetType === "Thiết bị" && String(ticket.createdAt || ticket.foundDate || ticket.dueDate || "").slice(0, 10) === day)
    .reduce((sum, ticket) => sum + ticketCost(ticket), 0));
  const totalCost = days.map((_, index) => bikeCost[index] + equipmentCost[index]);
  return {
    days,
    labels: days.map(dayLabel),
    revenue,
    bikeCost,
    equipmentCost,
    totalCost,
    profit: days.map((_, index) => revenue[index] - totalCost[index])
  };
}

function lastSeriesValue(series = []) {
  return Number(series[series.length - 1] || 0);
}

function dashboardView() {
  const s = dashboardStats();
  const alerts = alertItems();
  const unread = unreadCount();
  const reminders = todayReminderItems();
  const roomActivities = todayRoomActivityItems();
  const assetActivities = todayAssetActivityItems();
  const arrivals = upcomingGuestItems();
  const activities = todayActivityItems();
  const db = getDb();
  const financeDays = dashboardDailyFinance();
  const todayRevenue = lastSeriesValue(financeDays.revenue);
  const todayBikeCost = lastSeriesValue(financeDays.bikeCost);
  const todayEquipmentCost = lastSeriesValue(financeDays.equipmentCost);
  const todayCost = lastSeriesValue(financeDays.totalCost);
  const todayProfit = todayRevenue - todayCost;
  return `
    <div class="ops-dashboard">
      <div class="ops-topbar">
        <div class="ops-title-wrap">
          <button class="ghost ops-menu-button" data-action="toggle-nav">☰</button>
          <div><h1>Tổng quan vận hành</h1><p>Cập nhật lúc ${new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${formatDate(new Date())}</p></div>
        </div>
        <div class="ops-top-actions">
          <button class="ops-date" data-view="maintenanceCalendar">▣ Hôm nay: ${formatDate(new Date())}⌄</button>
          <button class="ops-bell" data-view="notifications">♢${unread ? `<span>${unread}</span>` : ""}</button>
          <button class="ops-user" data-view="users"><b>${state.user?.name?.[0] || "A"}</b><span>${state.user?.name || "Admin"}</span></button>
        </div>
      </div>

      <div class="ops-kpi-grid">
        ${opsStatCard("♞", "Tổng số xe", s.bikesTotal, "Tất cả", "teal", true)}
        ${opsStatCard("✓", "Sẵn sàng", s.bikeStatus("Có sẵn"), "Sẵn sàng cho thuê", "green")}
        ${opsStatCard("♞", "Đang thuê", s.bikeStatus("Đang thuê"), "Đang sử dụng", "blue")}
        ${opsStatCard("◷", "Quá hạn", s.bikeStatus("Quá hạn"), "Cần liên hệ khách", "orange")}
        ${opsStatCard("⚒", "Đang sửa", s.bikeStatus("Đang sửa") + s.bikeStatus("Hư hỏng"), "Đang sửa chữa", "red")}
        ${opsStatCard("❄", "Máy lạnh tổng", s.acTotal, "Tất cả", "blue")}
        ${opsStatCard("✓", "Đang hoạt động", s.acWorking, "Hoạt động tốt", "green")}
        ${opsStatCard("!", "Đang hư", s.acBroken + s.washersIssue, "Cần sửa chữa", "orange")}
        ${opsStatCard("⚒", "Đang sửa", db.equipment.filter((e) => e.condition === "Đang sửa").length, "Đang xử lý", "red")}
        ${opsStatCard("▦", "Bảo trì đến hạn", s.dueMaintenance + s.acDueClean, "Trong 7 ngày tới", "purple")}
        ${opsStatCard("▤", "Phiếu thuê hôm nay", db.rentals.filter((r) => r.start.slice(0, 10) === todayISO()).length, "Tổng số", "blue")}
        ${opsStatCard("➜", "Đang diễn ra", db.rentals.filter((r) => ["Đang thuê", "Quá hạn"].includes(r.status)).length, "Hiện tại", "green")}
        ${opsStatCard("◷", "Sắp diễn ra", reminders.filter((r) => r.type === "rental").length, "Trong ngày", "orange")}
        ${opsStatCard("✓", "Hoàn thành", db.rentals.filter((r) => r.status === "Đã trả" && r.end.slice(0, 10) === todayISO()).length, "Hôm nay", "purple")}
        ${opsStatCard("×", "Đã hủy", db.rentals.filter((r) => r.status === "Đã hủy" && r.end.slice(0, 10) === todayISO()).length, "Hôm nay", "red")}
      </div>

      <div class="ops-main-grid">
        ${can("finance") ? opsFinanceCard("DOANH THU THEO NGÀY", money(todayRevenue), "7 ngày gần nhất", "green", [["Doanh thu tháng", money(s.monthRevenue)], ["Tiền chưa thanh toán", money(s.unpaid)], ["Doanh thu năm", money(s.monthRevenue * 12)]], financeDays.revenue, financeDays.labels) : ""}
        ${can("finance") ? opsFinanceCard("CHI PHÍ THEO NGÀY", money(todayCost), "Theo ngày phát sinh phiếu", "red", [["Sửa xe", money(todayBikeCost)], ["Sửa thiết bị", money(todayEquipmentCost)], ["Chi phí khác", money(0)]], financeDays.totalCost, financeDays.labels) : ""}
        ${can("finance") ? opsProfitCard(todayProfit, financeDays.profit, financeDays.labels) : ""}
        <div class="card ops-alert-card">
          <div class="ops-card-title"><h3>CẢNH BÁO</h3><button class="ghost" data-view="notifications">Xem tất cả</button></div>
          ${opsAlertGroups(alerts)}
        </div>
      </div>

      <div class="ops-bottom-grid">
        <div class="card ops-quick-card">
          <div class="ops-card-title"><h3>THAO TÁC NHANH</h3></div>
          <div class="ops-quick-actions">
            ${quickAction("Thêm thuê xe", "♞", "green", "modal:rental")}
            ${quickAction("Trả xe", "↩", "blue", "rentals")}
            ${quickAction("Bảo trì xe", "⚒", "orange", "modal:ticket:Xe máy")}
            ${quickAction("Lịch thuê", "▦", "purple", "calendar")}
            ${quickAction("Thêm bảo trì", "❄", "teal", "modal:ticket:Thiết bị")}
            ${quickAction("Sửa thiết bị", "▧", "red", "equipmentMaintenance")}
          </div>
        </div>
        <div class="card ops-reminder-card">
          <div class="ops-card-title"><h3>LỊCH NHẮC NHỞ HÔM NAY</h3><button class="ghost" data-view="maintenanceCalendar">Xem tất cả</button></div>
          ${reminders.length ? `<div class="reminder-list">${reminders.slice(0, 5).map((item) => reminderItem(item)).join("")}</div>` : `<div class="empty">Không có lịch nhắc trong ngày.</div>`}
        </div>
        <div class="card ops-activity-card">
          <div class="ops-card-title"><h3>HOẠT ĐỘNG HÔM NAY</h3><button class="ghost" data-view="audit">Xem tất cả</button></div>
          ${activities.length ? `<div class="activity-list">${activities.slice(0, 6).map((item) => activityItem(item)).join("")}</div>` : `<div class="empty">Chưa có hoạt động hôm nay.</div>`}
        </div>
      </div>
      <div class="ops-activity-split">
        ${activityBoard("\u1ea2nh/c\u1eadp nh\u1eadt hi\u1ec3n th\u1ecb ph\u00f2ng", "rooms", roomActivities, "Ch\u01b0a c\u00f3 c\u1eadp nh\u1eadt ph\u00f2ng h\u00f4m nay.")}
        ${activityBoard("Xe v\u00e0 thi\u1ebft b\u1ecb", "bikeMaintenance", assetActivities, "Ch\u01b0a c\u00f3 c\u1eadp nh\u1eadt xe/thi\u1ebft b\u1ecb h\u00f4m nay.")}
        ${activityBoard("Kh\u00e1ch s\u1eafp \u0111\u1ebfn trong 7 ng\u00e0y", "bookingTimeline", arrivals, "Ch\u01b0a c\u00f3 kh\u00e1ch s\u1eafp \u0111\u1ebfn trong 7 ng\u00e0y.")}
      </div>
    </div>
  `;
}

function opsStatCard(icon, label, value, caption, tone, active = false) {
  return `<div class="ops-stat ${active ? "active" : ""}"><span class="ops-icon ${tone}">${icon}</span><div><p>${label}</p><strong>${value}</strong><small>${caption}</small></div></div>`;
}

function opsFinanceCard(title, value, caption, tone, items, series = [], labels = []) {
  return `<div class="card ops-finance ${tone}"><h3>${title}</h3><strong>${value}</strong><p>${caption}</p>${opsLineChart(tone, series)}${opsChartLabels(labels)}<div class="ops-finance-split">${items.map(([label, val]) => `<span><small>${label}</small><b>${val}</b></span>`).join("")}</div></div>`;
}

function opsChartLabels(labels = []) {
  const safeLabels = labels.length ? labels : ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "24:00"];
  return `<div class="ops-chart-times">${safeLabels.map((label) => `<span>${label}</span>`).join("")}</div>`;
}

function opsLineChart(tone, series = []) {
  const width = 288;
  const bottom = 92;
  const range = 70;
  let points = "";
  if (series.length) {
    const max = Math.max(1, ...series.map((value) => Math.max(0, Number(value || 0))));
    points = series.map((value, index) => {
      const x = series.length === 1 ? 0 : (index / (series.length - 1)) * width;
      const y = bottom - (Math.max(0, Number(value || 0)) / max) * range;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  } else {
    points = tone === "red"
      ? "0,70 18,67 36,58 54,55 72,48 90,58 108,42 126,54 144,34 162,44 180,38 198,48 216,36 234,25 252,20 270,27 288,26"
      : "0,72 18,72 36,67 54,58 72,60 90,56 108,48 126,54 144,36 162,44 180,34 198,40 216,46 234,37 252,31 270,22 288,27";
  }
  const area = `${points} 288,92 0,92`;
  return `<div class="ops-line-chart ${tone}">
    <svg viewBox="0 0 288 96" preserveAspectRatio="none" aria-hidden="true">
      <polygon points="${area}"></polygon>
      <polyline points="${points}"></polyline>
    </svg>
  </div>`;
}

function opsProfitCard(value, series = [], labels = []) {
  const tone = value >= 0 ? "green" : "red";
  const values = series.length ? series : [18, -34, 52, 8, -25, 42, 64];
  const max = Math.max(1, ...values.map((item) => Math.abs(Number(item || 0))));
  const bars = values.map((item) => {
    const numeric = Number(item || 0);
    const height = Math.max(8, Math.round((Math.abs(numeric) / max) * 64));
    return `<i class="${numeric < 0 ? "neg" : ""}" style="height:${height}px"></i>`;
  }).join("");
  return `<div class="card ops-profit ${tone}"><h3>LỢI NHUẬN ƯỚC TÍNH</h3><strong>${money(value)}</strong><p>Theo ngày</p><div class="ops-bars">${bars}</div>${opsChartLabels(labels)}<small>Lợi nhuận tháng</small><b>${money(dashboardStats().profit)}</b></div>`;
}

function opsAlertItem(item) {
  return `<div class="ops-alert ${alertTone(item.title)}"><span>${alertIcon(item.title)}</span><div><strong>${item.title}</strong><small>${item.message}</small></div><time>${item.date ? formatDate(item.date) : "-"}</time></div>`;
}

function opsAlertGroups(alerts = []) {
  const groups = [
    { key: "bike", title: "Xe máy", icon: navIcon("motorbikes"), items: [] },
    { key: "equipment", title: "Thiết bị", icon: navIcon("equipment"), items: [] },
    { key: "guest", title: "Khách/Tour", icon: navIcon("bookingTimeline"), items: [] }
  ];
  alerts.forEach((item) => {
    groups.find((group) => group.key === alertCategory(item))?.items.push(item);
  });
  if (!alerts.length) return `<div class="empty">Không có cảnh báo mới.</div>`;
  return `<div class="ops-alert-groups">
    ${groups.map((group) => `<section class="ops-alert-group ${group.key}">
      <div class="ops-alert-group-head"><span>${group.icon}</span><strong>${group.title}</strong><em>${group.items.length}</em></div>
      <div class="ops-alert-list">${group.items.length ? group.items.slice(0, 3).map((item) => opsAlertItem(item)).join("") : `<div class="empty compact">Chưa có lượt tạo phiếu mới.</div>`}</div>
    </section>`).join("")}
  </div>`;
}

function alertCategory(item = {}) {
  if (["bike", "equipment", "guest"].includes(item.category)) return item.category;
  const text = `${item.title || ""} ${item.message || ""}`.toLowerCase();
  if (/thiết bị|máy lạnh|máy giặt|bảo trì thiết bị|sửa thiết bị|ưu tiên cao/.test(text)) return "equipment";
  if (/xe|thay nhớt|sửa xe|bảo trì theo km|motorbike/.test(text)) return "bike";
  return "guest";
}

function opStatCard(label, value, caption, icon, tone) {
  return `<div class="op-stat-card"><span class="op-icon ${tone}">${icon}</span><div><p>${label}</p><strong>${value}</strong><small>${caption}</small></div></div>`;
}

function financePanel(title, value, caption, tone, items) {
  return `<div class="card finance-panel ${tone}">
    <h3>${title}</h3>
    <strong>${value}</strong>
    <p>${caption}</p>
    <div class="mini-sparkline">${Array.from({ length: 11 }, (_, index) => `<i style="height:${18 + ((index * 7) % 34)}px"></i>`).join("")}</div>
    <div class="finance-split">${items.map(([label, val]) => `<span><small>${label}</small><b>${val}</b></span>`).join("")}</div>
  </div>`;
}

function profitPanel(value) {
  const tone = value >= 0 ? "green" : "red";
  return `<div class="card finance-panel compact ${tone}">
    <h3>LỢI NHUẬN ƯỚC TÍNH</h3>
    <strong>${money(value)}</strong>
    <p>Hôm nay</p>
    <div class="mini-bars">${[20, 36, 52, 30, 42, 60, 34, 54].map((height) => `<i style="height:${height}px"></i>`).join("")}</div>
    <small>Lợi nhuận tháng</small>
    <b>${money(dashboardStats().profit)}</b>
  </div>`;
}

function quickAction(label, icon, tone, target) {
  const attr = target.startsWith("modal:") ? `data-modal="${target.replace("modal:", "")}"` : `data-view="${target}"`;
  return `<button class="quick-action" ${attr}><span class="${tone}">${icon}</span><small>${label}</small></button>`;
}

function todayReminderItems() {
  const db = getDb();
  const today = todayISO();
  const startDay = new Date(`${today}T00:00`);
  const endDay = new Date(`${today}T23:59`);
  const items = [];
  db.rentals.forEach((rental) => {
    const bike = db.motorbikes.find((b) => b.id === rental.bikeId);
    const start = new Date(rental.start);
    const end = new Date(rental.end);
    if (start >= startDay && start <= endDay) {
      items.push({ time: rental.start, type: "rental", tone: "blue", icon: "♨", title: `Giao xe ${bike?.code || ""}`, detail: `${rental.customer} · Phòng ${rental.room}` });
    }
    if (end >= startDay && end <= endDay) {
      items.push({ time: rental.end, type: "return", tone: rental.status === "Quá hạn" ? "red" : "orange", icon: "↩", title: `Nhận xe ${bike?.code || ""}`, detail: `${rental.customer} · ${rental.status}` });
    }
  });
  db.motorbikes.filter((bike) => new Date(bike.nextMaintenance) <= endDay || isBikeKmDue(bike)).forEach((bike) => {
    items.push({ time: `${today}T10:00`, type: "maintenance", tone: "orange", icon: "⚒", title: `Bảo trì xe ${bike.code}`, detail: oilHint(bike) });
  });
  db.equipment.filter((item) => new Date(item.nextMaintenance) <= endDay || item.condition !== "Hoạt động").forEach((item) => {
    items.push({ time: `${today}T11:00`, type: "equipment", tone: item.condition === "Đang hư" ? "red" : "purple", icon: item.type === "Máy lạnh" ? "❄" : "▧", title: `${item.name}`, detail: `${item.room || item.area} · ${item.condition}` });
  });
  return items.sort((a, b) => new Date(a.time) - new Date(b.time)).slice(0, 9);
}

function reminderItem(item) {
  return `<div class="reminder-item"><time>${new Date(item.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</time><span class="${item.tone}">${item.icon}</span><div><strong>${item.title}</strong><small>${item.detail}</small></div></div>`;
}

function todayActivityItems() {
  const db = getDb();
  const today = todayISO();
  const activities = [];
  db.rentals.filter((r) => r.start.slice(0, 10) === today || r.end.slice(0, 10) === today).forEach((rental) => {
    const bike = db.motorbikes.find((b) => b.id === rental.bikeId);
    activities.push({ time: rental.start, tone: "green", icon: "♨", title: `Xe ${bike?.code || ""} ${rental.status.toLowerCase()}`, detail: `Khách: ${rental.customer}` });
  });
  db.tickets.filter((ticket) => ticket.foundDate === today || ticket.dueDate === today).forEach((ticket) => {
    activities.push({ time: `${today}T09:30`, tone: ticket.priority === "Khẩn cấp" ? "red" : "orange", icon: "⚒", title: `${ticket.code} · ${ticket.status}`, detail: ticket.issue });
  });
  db.auditLogs.filter((log) => log.createdAt.slice(0, 10) === today).slice(0, 4).forEach((log) => {
    activities.push({ time: log.createdAt, tone: "blue", icon: "✓", title: log.action, detail: `${log.user} · ${log.record}` });
  });
  return activities.sort((a, b) => new Date(a.time) - new Date(b.time)).slice(0, 8);
}

function activityItem(item) {
  return `<div class="activity-item"><time>${new Date(item.time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</time><span class="${item.tone}">${item.icon}</span><div><strong>${item.title}</strong><small>${item.detail}</small></div></div>`;
}

function activityBoard(title, view, items, emptyText) {
  return `<div class="card ops-activity-card ops-activity-board">
    <div class="ops-card-title"><h3>${title}</h3><button class="ghost" data-view="${view}">Xem t\u1ea5t c\u1ea3</button></div>
    ${items.length ? `<div class="activity-list">${items.slice(0, 7).map((item) => activityItem(item)).join("")}</div>` : `<div class="empty">${emptyText}</div>`}
  </div>`;
}

function todayRoomActivityItems() {
  const db = getDb();
  const today = todayISO();
  const logs = db.auditLogs
    .filter((log) => log.createdAt?.slice(0, 10) === today && /room|ph\u00f2ng/i.test(`${log.action} ${log.record}`))
    .map((log) => ({ time: log.createdAt, tone: "blue", icon: "\u2713", title: log.action, detail: `${log.user} \u00b7 ${log.record || "Ph\u00f2ng"}` }));
  const roomRows = (db.rooms || defaultRoomCatalog()).slice(0, 6).map((room, index) => {
    const hotel = (db.hotels || defaultHotelCatalog()).find((item) => item.id === room.hotelId);
    return {
      time: `${today}T09:${String(20 + index).padStart(2, "0")}`,
      tone: room.hidden ? "orange" : "blue",
      icon: room.hidden ? "!" : "\u2713",
      title: room.hidden ? "Ph\u00f2ng \u0111ang \u1ea9n kh\u1ecfi timeline" : "C\u1eadp nh\u1eadt hi\u1ec3n th\u1ecb ph\u00f2ng",
      detail: `${hotel?.name || "Kh\u00e1ch s\u1ea1n"} \u00b7 ${room.code} - ${room.name}`
    };
  });
  return [...logs, ...roomRows].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
}

function todayAssetActivityItems() {
  const db = getDb();
  const today = todayISO();
  const ticketItems = db.tickets
    .filter((ticket) => ticket.foundDate === today || ticket.dueDate === today)
    .map((ticket) => ({
      time: `${today}T09:30`,
      tone: ticket.assetType === "Xe m\u00e1y" ? "orange" : "purple",
      icon: ticket.assetType === "Xe m\u00e1y" ? "\u2692" : "\u25a7",
      title: `${ticket.code} \u00b7 ${ticket.status}`,
      detail: `${ticket.assetType} \u00b7 ${ticket.issue}`
    }));
  const bikeItems = db.motorbikes
    .filter((bike) => isBikeKmDue(bike) || new Date(bike.nextMaintenance) <= new Date(todayISO(7)))
    .map((bike, index) => ({
      time: `${today}T10:${String(index).padStart(2, "0")}`,
      tone: "orange",
      icon: "\u2692",
      title: `${bike.code} \u00b7 ${bike.name}`,
      detail: oilHint(bike)
    }));
  const equipmentItems = db.equipment
    .filter((item) => item.condition !== "Ho\u1ea1t \u0111\u1ed9ng" || new Date(item.nextMaintenance) <= new Date(todayISO(7)))
    .map((item, index) => ({
      time: `${today}T11:${String(index).padStart(2, "0")}`,
      tone: item.condition === "\u0110ang h\u01b0" ? "red" : "purple",
      icon: "\u25a7",
      title: `${item.code || item.name} \u00b7 ${item.type}`,
      detail: `${item.room || item.area || "-"} \u00b7 ${item.condition}`
    }));
  return [...ticketItems, ...bikeItems, ...equipmentItems].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
}

function upcomingGuestItems() {
  const today = todayISO();
  const end = todayISO(7);
  const data = bookingSeedData(today.slice(0, 7));
  return data.bookings
    .filter((booking) => booking.start >= today && booking.start <= end && booking.status !== "\u0110\u00e3 h\u1ee7y")
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .map((booking) => {
      const room = data.rooms.find((item) => item.code === booking.room);
      const hotel = data.hotels.find((item) => item.id === room?.hotelId);
      return {
        time: `${booking.start}T14:00`,
        tone: booking.tone || bookingStatusTone(booking.status),
        icon: "\u25ce",
        title: `${booking.group} - ${booking.guests} kh\u00e1ch`,
        detail: `${formatDate(booking.start)} \u2192 ${formatDate(booking.end)} \u00b7 ${hotel?.name || booking.hotelName || "Kh\u00e1ch s\u1ea1n"} \u00b7 ${booking.room}`
      };
    });
}

function alertIcon(title) {
  if (title.includes("quá hạn")) return "⚒";
  if (title.includes("bảo trì") || title.includes("thay nhớt")) return "⚒";
  if (title.includes("Thiết bị") || title.includes("Máy lạnh")) return "▧";
  if (title.includes("thanh toán")) return "$";
  return "!";
}

function menuHubView() {
  const items = menuTree
    .map((item) => {
      const children = (item.children || []).filter((child) => can(menuPermission(child.key)));
      if (!can(menuPermission(item.key)) && !children.length) return "";
      return menuHubCard(item.key, children);
    })
    .join("");
  return `
    <section class="menu-hub">
      <div class="menu-hub-head">
        <div>
          <h1>COCO BAY</h1>
          <p>Hệ thống quản lý nội bộ</p>
        </div>
        <button class="ghost hub-menu-button" data-action="toggle-nav">☰</button>
      </div>
      <div class="menu-card-list">${items}</div>
    </section>
  `;
}

function menuHubCard(key, children = []) {
  return `
    <div class="menu-card ${state.view === key || children.some((child) => child.key === state.view) ? "active" : ""}">
      <button data-view="${key}">
        <span class="menu-card-icon ${navColor(key)}">${navIcon(key)}</span>
        <span class="menu-card-text"><strong>${menuNumber(key)}. ${menuLabel(key)}</strong><small>${menuMeta[key]?.desc || ""}</small></span>
        <span class="menu-card-arrow">›</span>
      </button>
      ${children.length ? `<div class="menu-card-children">${children.map((child) => `<button class="${state.view === child.key ? "active" : ""}" data-view="${child.key}"><span class="menu-card-icon ${navColor(child.key)}">${navIcon(child.key)}</span><span class="menu-card-text"><strong>${menuNumber(child.key)}. ${menuLabel(child.key)}</strong><small>${menuMeta[child.key]?.desc || ""}</small></span><span class="menu-card-arrow">›</span></button>`).join("")}</div>` : ""}
    </div>
  `;
}

function metric(label, value) {
  return `<div class="card metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function donutChart(title, items, unit) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const safeTotal = Math.max(1, total);
  let cursor = 0;
  const colors = ["#027f9b", "#19b6a3", "#c77b00", "#c0392b", "#7f8c8d", "#07566a", "#8e6f37", "#4aa3df"];
  const stops = items.map((item, index) => {
    const start = cursor;
    const end = cursor + (item.value / safeTotal) * 100;
    cursor = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  }).join(", ");
  return `
    <div class="card chart-card">
      <div class="panel-title"><h3>${title}</h3><span class="pill">${total} ${unit}</span></div>
      <div class="donut-layout">
        <div class="donut" style="background: conic-gradient(${stops || "#edf1f2 0% 100%"})"><span>${total}</span></div>
        <div class="legend">
          ${items.map((item, index) => `<div><i style="background:${colors[index % colors.length]}"></i><span>${item.label}</span><strong>${item.value}</strong></div>`).join("") || `<div class="empty">Chưa có dữ liệu.</div>`}
        </div>
      </div>
    </div>
  `;
}

function barChart(title, items, unit, isMoney = false) {
  const max = Math.max(1, ...items.map((item) => Math.abs(item.value)));
  return `
    <div class="card chart-card">
      <div class="panel-title"><h3>${title}</h3></div>
      <div class="bar-list">
        ${items.map((item) => {
          const width = Math.max(4, Math.round((Math.abs(item.value) / max) * 100));
          return `<div class="bar-row">
            <div class="bar-label"><span>${item.label}</span><strong>${isMoney ? money(item.value) : `${item.value} ${unit}`}</strong></div>
            <div class="bar-track"><span class="${item.tone || statusClass(item.label)}" style="width:${width}%"></span></div>
          </div>`;
        }).join("") || `<div class="empty">Chưa có dữ liệu.</div>`}
      </div>
    </div>
  `;
}

function alertTone(title) {
  if (title.includes("quá hạn") || title.includes("Ưu tiên cao")) return "danger";
  if (title.includes("Chưa thanh toán") || title.includes("Sắp giao") || title.includes("Phiếu sửa")) return "warning";
  return "";
}

function alertItems() {
  const db = getDb();
  const items = [];
  db.notifications
    .filter((n) => !n.read && /phiếu sửa|sửa xe|sửa thiết bị/i.test(`${n.title} ${n.message} ${n.type}`))
    .forEach((n) => items.push({ title: n.title, message: n.message, date: n.createdAt, category: notificationAlertCategory(n) }));
  db.rentals.filter((r) => r.status === "Quá hạn").forEach((r) => items.push({ title: `Xe quá hạn: ${r.code}`, message: `${r.customer} - phòng ${r.room} - hạn trả ${formatDateTime(r.end)}`, category: "guest" }));
  db.rentals.filter((r) => r.status === "Đã đặt" && new Date(r.start) <= new Date(Date.now() + 4 * 60 * 60 * 1000)).forEach((r) => items.push({ title: `Sắp giao xe: ${r.code}`, message: `${r.customer} nhận xe lúc ${formatDateTime(r.start)}`, category: "guest" }));
  db.tickets.filter((t) => !["Hoàn thành", "Đã hủy"].includes(t.status) && new Date(t.dueDate) < new Date()).forEach((t) => items.push({ title: `Phiếu sửa chữa quá hạn: ${t.code}`, message: t.issue, category: t.assetType === "Thiết bị" ? "equipment" : "bike" }));
  db.equipment.filter((e) => e.type === "Máy lạnh" && e.condition === "Đang hư" && e.note.toLowerCase().includes("có khách")).forEach((e) => items.push({ title: `Ưu tiên cao: ${e.name}`, message: "Máy lạnh phòng đang có khách bị hư.", category: "equipment" }));
  db.equipment.filter((e) => new Date(e.nextMaintenance) <= new Date(todayISO(7))).forEach((e) => items.push({ title: `Thiết bị đến hạn bảo trì: ${e.code}`, message: `${e.name} - hạn ${formatDate(e.nextMaintenance)}`, category: "equipment" }));
  db.motorbikes.filter(isBikeOilDue).forEach((b) => items.push({ title: `Đến hạn thay nhớt: ${b.code}`, message: `${b.name} đã chạy ${Number(b.odometer) - Number(b.lastOilChangeKm)} km từ lần thay nhớt gần nhất.`, category: "bike" }));
  db.motorbikes.filter(isBikeMaintenanceKmDue).forEach((b) => items.push({ title: `Đến hạn bảo trì theo km: ${b.code}`, message: `${b.name} đã chạy ${Number(b.odometer) - Number(b.lastMaintenanceKm)} km từ lần bảo trì gần nhất.`, category: "bike" }));
  db.rentals.filter((r) => Number(r.total) > Number(r.paid)).forEach((r) => items.push({ title: `Chưa thanh toán đủ: ${r.code}`, message: `Còn phải thu ${money(Number(r.total) - Number(r.paid))}`, category: "guest" }));
  upcomingGuestItems().slice(0, 3).forEach((item) => items.push({ title: `Khách sắp đến: ${item.title}`, message: item.detail, date: item.time, category: "guest" }));
  return items.slice(0, 15);
}

function notificationAlertCategory(notification = {}) {
  if (notification.type === "Sửa thiết bị") return "equipment";
  if (notification.type === "Sửa xe") return "bike";
  return alertCategory(notification);
}

function nextOilChangeKm(bike) {
  return Number(bike.lastOilChangeKm || 0) + Number(bike.oilChangeIntervalKm || 0);
}

function nextMaintenanceKm(bike) {
  return Number(bike.lastMaintenanceKm || 0) + Number(bike.maintenanceIntervalKm || 0);
}

function kmRemaining(current, next) {
  return Number(next || 0) - Number(current || 0);
}

function isBikeOilDue(bike) {
  return kmRemaining(bike.odometer, nextOilChangeKm(bike)) <= 50;
}

function isBikeMaintenanceKmDue(bike) {
  return kmRemaining(bike.odometer, nextMaintenanceKm(bike)) <= 100;
}

function isBikeKmDue(bike) {
  return isBikeOilDue(bike) || isBikeMaintenanceKmDue(bike);
}

function oilHint(bike) {
  const remaining = kmRemaining(bike.odometer, nextOilChangeKm(bike));
  if (remaining < 0) return `Quá hạn thay nhớt ${Math.abs(remaining).toLocaleString("vi-VN")} km`;
  if (remaining <= 50) return `Sắp thay nhớt: còn ${remaining.toLocaleString("vi-VN")} km`;
  return `Thay nhớt sau ${remaining.toLocaleString("vi-VN")} km`;
}

function maintenanceKmHint(bike) {
  const remaining = kmRemaining(bike.odometer, nextMaintenanceKm(bike));
  if (remaining < 0) return `Quá hạn bảo trì ${Math.abs(remaining).toLocaleString("vi-VN")} km`;
  if (remaining <= 100) return `Sắp bảo trì: còn ${remaining.toLocaleString("vi-VN")} km`;
  return `Bảo trì sau ${remaining.toLocaleString("vi-VN")} km`;
}

function daysSinceOilChange(bike) {
  const date = bike.lastOilChangeDate || bike.lastMaintenance || todayISO();
  return Math.max(0, Math.floor((new Date(todayISO()) - new Date(date)) / 86400000));
}

function isOilDateAlert(bike) {
  return Boolean(bike.oilAlertEnabled !== false && !bike.oilAlertHandled && daysSinceOilChange(bike) > 60);
}

function bikeAvatar(bike) {
  const image = Array.isArray(bike.images) ? bike.images[0] : "";
  const alt = `Ảnh đại diện ${bike.code}`;
  if (image) {
    return `<div class="bike-avatar" tabindex="0"><img src="${image}" alt="${alt}"><div class="bike-avatar-zoom"><img src="${image}" alt="${alt} phóng to"></div></div>`;
  }
  return `<div class="bike-avatar placeholder" tabindex="0"><span>${bike.code}</span><div class="bike-avatar-zoom placeholder"><span>${bike.code}<small>Chưa có ảnh</small></span></div></div>`;
}

function personAvatar(person) {
  const image = person.photo || "";
  const initials = String(person.name || person.code || "NS").split(/\s+/).filter(Boolean).slice(-2).map((part) => part[0]).join("").toUpperCase();
  const alt = `Ảnh nhân viên ${person.name || person.code}`;
  if (image) {
    return `<div class="bike-avatar person-avatar" tabindex="0"><img src="${image}" alt="${alt}"><div class="bike-avatar-zoom"><img src="${image}" alt="${alt} phóng to"></div></div>`;
  }
  return `<div class="bike-avatar person-avatar placeholder" tabindex="0"><span>${initials || person.code}</span><div class="bike-avatar-zoom placeholder"><span>${person.name || person.code}<small>Chưa có ảnh</small></span></div></div>`;
}



function bookingSeedData(yearMonth = todayISO().slice(0, 7)) {
  const db = getDb();
  const hotels = Array.isArray(db.hotels) ? db.hotels : [];
  const rooms = (Array.isArray(db.rooms) ? db.rooms : []).filter((room) => !room.hidden);
  const deletedSeedBookings = new Set(db.settings?.deletedSeedBookings || []);
  const sampleRows = [];
  const bookings = sampleRows.filter(([id]) => !deletedSeedBookings.has(id)).map(([id, room, group, guests, startDay, endDay, status, tone, customer, phone, total, paid]) => {
    const maxDay = daysInMonth(yearMonth);
    const safeStartDay = Math.min(startDay, Math.max(1, maxDay - 1));
    const safeEndDay = Math.min(Math.max(endDay, safeStartDay + 1), maxDay);
    return {
      id,
      room,
      group,
      guests,
      start: `${yearMonth}-${String(safeStartDay).padStart(2, "0")}`,
      end: `${yearMonth}-${String(safeEndDay).padStart(2, "0")}`,
      status,
      tone,
      customer,
      phone,
      total,
      paid,
      serviceNote: "D\u1ecbch v\u1ee5: \u0103n s\u00e1ng, h\u1ed7 tr\u1ee3 xe m\u00e1y",
      notes: "Kh\u00e1ch quen, h\u1ed7 tr\u1ee3 \u0103n s\u00e1ng"
    };
  });
  const savedBookings = (db.hotelBookings || []).map((booking) => ({ ...booking, tone: booking.tone || bookingStatusTone(booking.status) }));
  const services = [];
  return { hotels, rooms, bookings: [...bookings, ...savedBookings], services };
}

function bookingFilterState() {
  if (!state.bookingTimeline) {
    state.bookingTimeline = { hotel: "all", period: "month", month: todayISO().slice(0, 7), date: todayISO() };
  }
  return state.bookingTimeline;
}

function parseISODate(value) {
  return new Date(`${value}T00:00:00`);
}

function dateToISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDaysISO(value, days) {
  const date = parseISODate(value);
  date.setDate(date.getDate() + days);
  return dateToISO(date);
}

function daysInMonth(yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function bookingTimelineDates(period, yearMonth, dateValue) {
  const month = yearMonth || todayISO().slice(0, 7);
  const date = dateValue || `${month}-01`;
  let start = `${month}-01`;
  let count = daysInMonth(month);
  if (period === "day") {
    start = date;
    count = 1;
  }
  if (period === "week") {
    const base = parseISODate(date);
    const weekday = base.getDay();
    const diff = weekday === 0 ? -6 : 1 - weekday;
    base.setDate(base.getDate() + diff);
    start = dateToISO(base);
    count = 7;
  }
  return Array.from({ length: count }, (_, index) => {
    const iso = addDaysISO(start, index);
    const d = parseISODate(iso);
    return {
      iso,
      day: d.getDate(),
      label: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()],
      weekend: d.getDay() === 0
    };
  });
}

function bookingPeriodLabel(period) {
  if (period === "day") return "Timeline ng\u00e0y";
  if (period === "week") return "Timeline tu\u1ea7n";
  return "Timeline th\u00e1ng";
}

function bookingTimelineView() {
  const current = new Date();
  const filters = bookingFilterState();
  const yearMonth = filters.month || todayISO().slice(0, 7);
  const data = bookingSeedData(yearMonth);
  const days = bookingTimelineDates(filters.period, yearMonth, filters.date);
  const visibleHotels = filters.hotel === "all" ? data.hotels : data.hotels.filter((hotel) => hotel.id === filters.hotel);
  const monthLabel = parseISODate(`${yearMonth}-01`).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
  const visibleRoomCodes = new Set(data.rooms.filter((room) => filters.hotel === "all" || room.hotelId === filters.hotel).map((room) => room.code));
  const visibleBookings = data.bookings.filter((booking) => visibleRoomCodes.has(booking.room) && bookingVisibleSpan(booking, days));
  const selected = data.bookings.find((booking) => booking.start.slice(0, 7) === yearMonth) || data.bookings[0];
  const todayPosition = bookingTodayLineLeft(days);
  const boardStyle = `--booking-days:${days.length};--booking-min:${bookingGridWidth(days)}px`;
  return `
    <section class="booking-page">
      <div class="booking-head"><div><h2>L\u1ecaCH \u0110\u1eb6T PH\u00d2NG T\u1ed4NG H\u1ee2P</h2><p>Qu\u1ea3n l\u00fd \u0111\u1eb7t ph\u00f2ng nhi\u1ec1u kh\u00e1ch s\u1ea1n - nhi\u1ec1u nh\u00f3m kh\u00e1ch - nhi\u1ec1u ng\u00e0y</p></div>${can("booking_write") ? `<button class="primary" data-modal="booking">+ Th\u00eam \u0111\u1eb7t ph\u00f2ng</button>` : ""}</div>
      <div class="booking-toolbar">
        <select data-booking-hotel><option value="all">T\u1ea5t c\u1ea3 kh\u00e1ch s\u1ea1n</option>${data.hotels.map((hotel) => `<option value="${hotel.id}" ${filters.hotel === hotel.id ? "selected" : ""}>${hotel.name}</option>`).join("")}</select>
        <label class="booking-control"><span>Th\u00e1ng</span><input type="month" value="${yearMonth}" data-booking-month></label>
        <label class="booking-control"><span>Ng\u00e0y m\u1ed1c</span><input type="date" value="${filters.date || todayISO()}" data-booking-date></label>
        <button class="booking-date" type="button">\u25a3 ${monthLabel} - ${bookingPeriodLabel(filters.period)}</button>
        <div class="booking-tabs">
          <button type="button" data-booking-period="day" class="${filters.period === "day" ? "active" : ""}">Ng\u00e0y</button>
          <button type="button" data-booking-period="week" class="${filters.period === "week" ? "active" : ""}">Tu\u1ea7n</button>
          <button type="button" data-booking-period="month" class="${filters.period === "month" ? "active" : ""}">Th\u00e1ng</button>
        </div>
        <div class="booking-legend"><span class="green">\u0110\u00e3 x\u00e1c nh\u1eadn</span><span class="blue">\u0110\u00e3 c\u1ecdc</span><span class="orange">\u0110ang \u1edf</span><span class="purple">Tr\u1ea3 ph\u00f2ng</span><span class="red">\u0110\u00e3 h\u1ee7y</span></div>
      </div>
      <div class="booking-layout"><div class="booking-board" style="${boardStyle}"><div class="booking-grid-head"><div></div>${days.map((day) => `<div class="${day.weekend ? "weekend" : ""}"><strong>${day.day}</strong><small>${day.label}</small></div>`).join("")}</div><div class="booking-rows">${visibleHotels.map((hotel) => bookingHotelBlock(hotel, data.rooms.filter((room) => room.hotelId === hotel.id), visibleBookings, days)).join("")}</div>${todayPosition === null ? "" : `<div class="today-line" style="left:${todayPosition}%"><span>H\u00f4m nay ${current.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span></div>`}</div>${bookingDetailPanel(selected, data.services)}</div>
      ${bookingHistoryPanel(data)}
    </section>`;
}

function bookingDetailPanel(selected, services) {
  if (!selected) return `<aside class="booking-detail"><h3>CHI TI\u1ebeT \u0110\u1eb6T PH\u00d2NG</h3><p class="empty">Ch\u01b0a c\u00f3 \u0111\u1eb7t ph\u00f2ng.</p></aside>`;
  return `<aside class="booking-detail"><button class="booking-close">\u00d7</button><h3>CHI TI\u1ebeT \u0110\u1eb6T PH\u00d2NG</h3><div class="booking-detail-title"><span>\u25ce</span><div><strong>${selected.group}</strong>${pill(selected.status)}</div></div><dl><dt>M\u00e3 \u0111\u1eb7t ph\u00f2ng</dt><dd>#${selected.id}</dd><dt>Kh\u00e1ch s\u1ea1n</dt><dd>${selected.hotelName || "Coco Bay Resort"}</dd><dt>Ph\u00f2ng</dt><dd>${selected.room}</dd><dt>Ng\u00e0y \u0111\u1ebfn</dt><dd>${formatDate(selected.start)}</dd><dt>Ng\u00e0y \u0111i</dt><dd>${formatDate(selected.end)}</dd><dt>S\u1ed1 l\u01b0\u1ee3ng kh\u00e1ch</dt><dd>${selected.guests} ng\u01b0\u1eddi</dd><dt>Ng\u01b0\u1eddi li\u00ean h\u1ec7</dt><dd>${selected.customer}</dd><dt>S\u0110T</dt><dd>${selected.phone}</dd><dt>Ghi ch\u00fa d\u1ecbch v\u1ee5</dt><dd>${selected.serviceNote || "-"}</dd><dt>Ghi ch\u00fa kh\u00e1c</dt><dd>${selected.notes || "-"}</dd></dl><h4>D\u1ecaCH V\u1ee4 \u0110\u00c3 \u0110\u1eb6T</h4><div class="booking-services">${services.map((service) => `<div class="booking-service ${service.tone}"><span>${bookingServiceIcon(service.name)}</span><div><strong>${service.name}</strong><small>${service.date}</small></div><em>${service.qty}</em></div>`).join("")}</div><h4>THANH TO\u00c1N</h4><dl class="booking-pay"><dt>T\u1ed5ng ti\u1ec1n</dt><dd>${money(selected.total)}</dd><dt>\u0110\u00e3 c\u1ecdc</dt><dd>${money(selected.paid)}</dd><dt>C\u00f2n l\u1ea1i</dt><dd>${money(selected.total - selected.paid)}</dd><dt>Tr\u1ea1ng th\u00e1i</dt><dd>${pill(selected.status)}</dd></dl>${can("booking_edit") ? `<div class="booking-actions"><button class="secondary" data-modal="booking:${selected.id}">S\u1eeda \u0111\u1eb7t ph\u00f2ng</button><button class="secondary">Thanh to\u00e1n</button><button class="ghost">Check-in</button><button class="danger" type="button" data-action="delete-booking:${selected.id}">H\u1ee7y/x\u00f3a \u0111\u1eb7t ph\u00f2ng</button></div>` : `<p class="hint">T\u00e0i kho\u1ea3n n\u00e0y ch\u1ec9 c\u00f3 quy\u1ec1n xem l\u1ecbch \u0111\u1eb7t ph\u00f2ng.</p>`}</aside>`;
}

function bookingGridWidth(days) { return 220 + days.length * 86; }
function bookingDayLeft(index, days, fraction = 0.5) { return 220 / bookingGridWidth(days) * 100 + (index + fraction) * (86 / bookingGridWidth(days) * 100); }
function bookingTodayLineLeft(days) {
  const now = new Date();
  const today = now.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  const index = days.findIndex((day) => day.iso === today);
  if (index < 0) return null;
  const fraction = (now.getHours() * 60 + now.getMinutes()) / 1440;
  return bookingDayLeft(index, days, fraction);
}
function bookingVisibleSpan(booking, days) {
  if (!days.length) return null;
  const first = days[0].iso;
  const afterLast = addDaysISO(days[days.length - 1].iso, 1);
  if (booking.end <= first || booking.start >= afterLast) return null;
  const visibleStart = booking.start < first ? first : booking.start;
  const visibleEnd = booking.end > afterLast ? afterLast : booking.end;
  const startIndex = Math.max(0, days.findIndex((day) => day.iso === visibleStart));
  const span = Math.max(1, Math.round((parseISODate(visibleEnd) - parseISODate(visibleStart)) / 86400000));
  return { startIndex, span };
}
function bookingHotelBlock(hotel, rooms, bookings, days) { return `<div class="booking-hotel-row"><div class="booking-hotel-name"><span class="${hotel.tone}">\u25a5</span><strong>${hotel.name}</strong><small>${hotel.rooms} ph\u00f2ng</small></div>${days.map(() => `<div></div>`).join("")}</div>${rooms.map((room) => bookingRoomRow(room, bookings.filter((booking) => booking.room === room.code), days)).join("")}<div class="booking-more-row"><div>...</div>${days.map(() => `<div></div>`).join("")}</div>`; }
function bookingRoomRow(room, bookings, days) { return `<div class="booking-room-row"><div class="booking-room-name"><strong>${room.code}</strong> - ${room.name}</div>${days.map((day, index) => `<div>${bookings.map((booking) => ({ booking, span: bookingVisibleSpan(booking, days) })).filter((item) => item.span && item.span.startIndex === index).map((item) => bookingPill(item.booking, item.span.span)).join("")}</div>`).join("")}</div>`; }
function bookingSmallInfo(booking) {
  return [Number(booking.total) ? money(booking.total) : "", booking.serviceNote || "", booking.notes || ""].filter(Boolean).join(" \u00b7 ");
}
function bookingPill(booking, span) { return `<button class="booking-pill ${booking.tone || bookingStatusTone(booking.status)}" style="--span:${span}" ${can("booking_edit") ? `data-modal="booking:${booking.id}"` : ""}><strong>${booking.group} - ${booking.guests} kh\u00e1ch</strong><small>${formatDate(booking.start)} - ${formatDate(booking.end)}</small><em>${bookingSmallInfo(booking)}</em></button>`; }
function bookingStatusTone(status) { if (status === "\u0110\u00e3 c\u1ecdc") return "blue"; if (status === "\u0110ang \u1edf") return "orange"; if (status === "Tr\u1ea3 ph\u00f2ng") return "purple"; if (status === "\u0110\u00e3 h\u1ee7y") return "red"; return "green"; }
function bookingServiceIcon(name) { if (name.includes("xe")) return "\u2668"; if (name.includes("Tour")) return "\u25c9"; return "\u25a3"; }
function bookingDateInput(value) { return value ? String(value).slice(0, 10) : ""; }
function bookingForm(id) {
  const data = bookingSeedData();
  const booking = (getDb().hotelBookings || []).find((item) => item.id === id) || {};
  const roomOptions = data.rooms.map((room) => {
    const hotel = data.hotels.find((item) => item.id === room.hotelId);
    return [room.code, `${hotel?.name || ""} \u00b7 ${room.code} - ${room.name}`];
  });
  return `<div class="form-grid booking-form-grid">
    ${field("group", "T\u00ean nh\u00f3m/kh\u00e1ch", booking.group || "", true)}${field("customer", "Ng\u01b0\u1eddi li\u00ean h\u1ec7", booking.customer || "", true)}
    ${field("phone", "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i", booking.phone || "", true)}${field("guests", "S\u1ed1 kh\u00e1ch", booking.guests || 2, true, "number")}
    ${selectField("room", "Kh\u00e1ch s\u1ea1n / ph\u00f2ng", roomOptions, booking.room || roomOptions[0]?.[0], true)}${selectField("status", "Tr\u1ea1ng th\u00e1i", ["\u0110\u00e3 x\u00e1c nh\u1eadn", "\u0110\u00e3 c\u1ecdc", "\u0110ang \u1edf", "Tr\u1ea3 ph\u00f2ng", "\u0110\u00e3 h\u1ee7y"], booking.status || "\u0110\u00e3 x\u00e1c nh\u1eadn")}
    ${field("start", "Ng\u00e0y \u0111\u1ebfn", bookingDateInput(booking.start) || todayISO(), true, "date")}${field("end", "Ng\u00e0y \u0111i", bookingDateInput(booking.end) || todayISO(1), true, "date")}
    ${field("total", "T\u1ed5ng ti\u1ec1n", booking.total || 0, false, "number")}${field("paid", "\u0110\u00e3 c\u1ecdc / \u0111\u00e3 thu", booking.paid || 0, false, "number")}
    <div class="field full"><label>Ghi ch\u00fa d\u1ecbch v\u1ee5</label><textarea name="serviceNote" placeholder="V\u00ed d\u1ee5: Thu\u00ea xe m\u00e1y 2 xe, \u0103n s\u00e1ng, ph\u1ee5 thu...">${booking.serviceNote || ""}</textarea></div>
    <div class="field full"><label>Ghi ch\u00fa</label><textarea name="notes">${booking.notes || ""}</textarea></div>
  </div>`;
}
function bookingHasConflict(db, data, id = "") {
  const start = new Date(data.start);
  const end = new Date(data.end);
  return (db.hotelBookings || []).some((item) => item.id !== id && item.room === data.room && new Date(item.start) < end && new Date(item.end) > start && item.status !== "\u0110\u00e3 h\u1ee7y");
}
function upsertBooking(db, data, id) {
  if (!Array.isArray(db.hotelBookings)) db.hotelBookings = [];
  if (!data.start || !data.end || new Date(data.end) <= new Date(data.start)) {
    showToast("Ng\u00e0y \u0111i ph\u1ea3i sau ng\u00e0y \u0111\u1ebfn.");
    throw new Error("Invalid booking dates");
  }
  if (bookingHasConflict(db, data, id)) {
    showToast("Ph\u00f2ng n\u00e0y \u0111\u00e3 c\u00f3 kh\u00e1ch trong kho\u1ea3ng th\u1eddi gian \u0111\u00e3 ch\u1ecdn.");
    throw new Error("Booking conflict");
  }
  const seed = bookingSeedData();
  const room = seed.rooms.find((item) => item.code === data.room);
  const hotel = seed.hotels.find((item) => item.id === room?.hotelId);
  const payload = {
    ...data,
    hotelId: room?.hotelId || "",
    hotelName: hotel?.name || "",
    guests: +data.guests,
    total: +data.total,
    paid: +data.paid,
    tone: bookingStatusTone(data.status),
    createdAt: id ? (db.hotelBookings.find((item) => item.id === id)?.createdAt || nowLocal()) : nowLocal()
  };
  if (id) Object.assign(db.hotelBookings.find((item) => item.id === id), payload);
  else db.hotelBookings.push({ id: uid("BK"), ...payload });
}
function hotelsView() {
  const hotels = getDb().hotels || defaultHotelCatalog();
  return `<section class="booking-page hotel-management-page">
    ${pageHeader("Kh\u00e1ch s\u1ea1n", "Qu\u1ea3n l\u00fd danh s\u00e1ch kh\u00e1ch s\u1ea1n, th\u00f4ng tin li\u00ean h\u1ec7, s\u1ed1 ph\u00f2ng v\u00e0 b\u1ea3ng gi\u00e1 c\u00f3 th\u1ec3 ch\u1ec9nh s\u1eeda.", can("manage") ? `<button class="primary" data-modal="hotel">+ Th\u00eam kh\u00e1ch s\u1ea1n</button>` : "")}
    <div class="booking-simple-grid hotel-card-grid">
      ${hotels.map((hotel) => `<div class="booking-simple-card hotel-card"><span>${navIcon("hotels")}</span><div><strong>${hotel.name}</strong><small>M\u00e3: ${hotel.code || "-"} \u00b7 ${Number(hotel.rooms || 0)} ph\u00f2ng</small><small>\u0110\u1ecba ch\u1ec9: ${hotel.address || "-"}</small><small>Gi\u00e1 t\u1eeb: ${money(hotel.weekdayPrice)}</small><small>Tr\u1ea1ng th\u00e1i: ${hotel.status || "\u0110ang ho\u1ea1t \u0111\u1ed9ng"}</small><button class="secondary" data-modal="hotel:${hotel.id}">S\u1eeda th\u00f4ng tin / gi\u00e1</button></div></div>`).join("")}
    </div>
    <div class="table-wrap"><table><thead><tr><th>Kh\u00e1ch s\u1ea1n</th><th>S\u1ed1 ph\u00f2ng</th><th>Ng\u00e0y th\u01b0\u1eddng</th><th>Cu\u1ed1i tu\u1ea7n</th><th>L\u1ec5/T\u1ebft</th><th>Tr\u1ea1ng th\u00e1i</th><th>Thao t\u00e1c</th></tr></thead><tbody>
      ${hotels.map((hotel) => `<tr><td><strong>${hotel.name}</strong><br><span class="hint">${hotel.phone || ""} \u00b7 ${hotel.manager || ""}</span></td><td>${Number(hotel.rooms || 0)} ph\u00f2ng</td><td>${money(hotel.weekdayPrice)}</td><td>${money(hotel.weekendPrice)}</td><td>${money(hotel.holidayPrice)}</td><td>${pill(hotel.status || "\u0110ang ho\u1ea1t \u0111\u1ed9ng")}</td><td><button class="ghost" data-modal="hotel:${hotel.id}">S\u1eeda</button></td></tr>`).join("")}
    </tbody></table></div>
  </section>`;
}

function hotelForm(id) {
  const hotel = (getDb().hotels || []).find((item) => item.id === id) || {};
  return `<div class="form-grid booking-form-grid">
    ${field("code", "M\u00e3 kh\u00e1ch s\u1ea1n", hotel.code || nextCode("HT", getDb().hotels || []), true)}${field("name", "T\u00ean kh\u00e1ch s\u1ea1n", hotel.name || "", true)}
    ${field("rooms", "S\u1ed1 l\u01b0\u1ee3ng ph\u00f2ng", hotel.rooms || 0, true, "number")}${selectField("status", "Tr\u1ea1ng th\u00e1i", ["\u0110ang ho\u1ea1t \u0111\u1ed9ng", "T\u1ea1m ng\u01b0ng", "B\u1ea3o tr\u00ec"], hotel.status || "\u0110ang ho\u1ea1t \u0111\u1ed9ng")}
    ${field("phone", "S\u1ed1 \u0111i\u1ec7n tho\u1ea1i", hotel.phone || "")}${field("manager", "Ng\u01b0\u1eddi ph\u1ee5 tr\u00e1ch", hotel.manager || "")}
    ${field("address", "\u0110\u1ecba ch\u1ec9", hotel.address || "", false, "text")}${selectField("tone", "M\u00e0u hi\u1ec3n th\u1ecb timeline", [["green", "Xanh l\u00e1"], ["blue", "Xanh d\u01b0\u01a1ng"], ["purple", "T\u00edm"], ["orange", "Cam"], ["red", "\u0110\u1ecf"]], hotel.tone || "green")}
    ${field("weekdayPrice", "Gi\u00e1 ng\u00e0y th\u01b0\u1eddng", hotel.weekdayPrice || 0, false, "number")}${field("weekendPrice", "Gi\u00e1 cu\u1ed1i tu\u1ea7n", hotel.weekendPrice || 0, false, "number")}
    ${field("holidayPrice", "Gi\u00e1 ng\u00e0y l\u1ec5/T\u1ebft", hotel.holidayPrice || 0, false, "number")}${field("taxRate", "Thu\u1ebf/ph\u00ed d\u1ecbch v\u1ee5 (%)", hotel.taxRate || 0, false, "number")}
    <div class="field full"><label>Ghi ch\u00fa / ch\u00ednh s\u00e1ch gi\u00e1</label><textarea name="note">${hotel.note || ""}</textarea></div>
  </div>`;
}

function upsertHotel(db, data, id) {
  if (!Array.isArray(db.hotels)) db.hotels = defaultHotelCatalog();
  if (db.hotels.some((hotel) => hotel.id !== id && String(hotel.code || "").toLowerCase() === String(data.code || "").toLowerCase())) {
    showToast("M\u00e3 kh\u00e1ch s\u1ea1n \u0111\u00e3 t\u1ed3n t\u1ea1i.");
    throw new Error("Duplicate hotel code");
  }
  if (db.hotels.some((hotel) => hotel.id !== id && String(hotel.name || "").toLowerCase() === String(data.name || "").toLowerCase())) {
    showToast("T\u00ean kh\u00e1ch s\u1ea1n \u0111\u00e3 t\u1ed3n t\u1ea1i.");
    throw new Error("Duplicate hotel name");
  }
  const payload = {
    ...data,
    rooms: +data.rooms,
    weekdayPrice: +data.weekdayPrice,
    weekendPrice: +data.weekendPrice,
    holidayPrice: +data.holidayPrice,
    taxRate: +data.taxRate
  };
  if (id) Object.assign(db.hotels.find((hotel) => hotel.id === id), payload);
  else db.hotels.push({ id: uid("H"), ...payload });
}

function roomsView() {
  const db = getDb();
  const hotels = db.hotels || defaultHotelCatalog();
  const rooms = db.rooms || defaultRoomCatalog();
  const visibleRooms = rooms.filter((room) => !room.hidden).length;
  return `<section class="booking-page room-management-page">
    ${pageHeader("Ph\u00f2ng", "Th\u00eam, s\u1eeda, \u1ea9n/hi\u1ec7n ho\u1eb7c x\u00f3a ph\u00f2ng theo t\u1eebng kh\u00e1ch s\u1ea1n.", can("manage") ? `<button class="primary" data-modal="room">+ Th\u00eam ph\u00f2ng</button>` : "")}
    <div class="booking-simple-grid hotel-card-grid">
      ${rooms.map((room) => {
        const hotel = hotels.find((item) => item.id === room.hotelId);
        return `<div class="booking-simple-card hotel-card ${room.hidden ? "is-hidden" : ""}"><span>${navIcon("rooms")}</span><div><strong>${room.code}</strong><small>Lo\u1ea1i ph\u00f2ng: ${room.name}</small><small>Kh\u00e1ch s\u1ea1n: ${hotel?.name || "-"}</small><small>S\u1ee9c ch\u1ee9a: ${room.capacity || 2} kh\u00e1ch - ${room.hidden ? "\u0110ang \u1ea9n" : "\u0110ang hi\u1ec3n th\u1ecb"}</small><div class="room-actions"><button class="secondary" data-modal="room:${room.id}">S\u1eeda</button><button class="ghost" data-action="toggle-room:${room.id}">${room.hidden ? "Hi\u1ec7n" : "\u1ea8n"}</button><button class="danger" data-action="delete-room:${room.id}">X\u00f3a</button></div></div></div>`;
      }).join("")}
    </div>
    <div class="table-wrap"><table><thead><tr><th>Ph\u00f2ng</th><th>Lo\u1ea1i ph\u00f2ng</th><th>Kh\u00e1ch s\u1ea1n</th><th>S\u1ee9c ch\u1ee9a</th><th>Tr\u1ea1ng th\u00e1i</th><th>Gi\u00e1 ng\u00e0y th\u01b0\u1eddng</th><th>Thao t\u00e1c</th></tr></thead><tbody>
      ${rooms.map((room) => { const hotel = hotels.find((item) => item.id === room.hotelId); return `<tr class="${room.hidden ? "muted-row" : ""}"><td><strong>${room.code}</strong></td><td>${room.name}</td><td>${hotel?.name || "-"}</td><td>${room.capacity || 2} kh\u00e1ch</td><td>${pill(room.hidden ? "\u0110ang \u1ea9n" : "\u0110ang hi\u1ec3n th\u1ecb")}</td><td>${Number(room.weekdayPrice || 0) ? money(room.weekdayPrice) : "Theo gi\u00e1 kh\u00e1ch s\u1ea1n"}</td><td><div class="room-actions"><button class="ghost" data-modal="room:${room.id}">S\u1eeda</button><button class="ghost" data-action="toggle-room:${room.id}">${room.hidden ? "Hi\u1ec7n" : "\u1ea8n"}</button><button class="danger" data-action="delete-room:${room.id}">X\u00f3a</button></div></td></tr>`; }).join("")}
    </tbody></table></div>
    <p class="hint">\u0110ang hi\u1ec3n th\u1ecb ${visibleRooms}/${rooms.length} ph\u00f2ng. Ph\u00f2ng \u0111\u00e3 \u1ea9n s\u1ebd kh\u00f4ng xu\u1ea5t hi\u1ec7n trong form \u0111\u1eb7t ph\u00f2ng v\u00e0 timeline.</p>
  </section>`;
}

function roomForm(id) {
  const db = getDb();
  const room = (db.rooms || []).find((item) => item.id === id) || {};
  const hotels = db.hotels || defaultHotelCatalog();
  return `<div class="form-grid booking-form-grid">
    ${field("code", "M\u00e3/s\u1ed1 ph\u00f2ng", room.code || "", true)}${field("name", "Lo\u1ea1i ph\u00f2ng", room.name || "Standard", true)}
    ${selectField("hotelId", "Kh\u00e1ch s\u1ea1n", hotels.map((hotel) => [hotel.id, hotel.name]), room.hotelId || hotels[0]?.id, true)}${field("capacity", "S\u1ee9c ch\u1ee9a", room.capacity || 2, false, "number")}
    ${field("floor", "T\u1ea7ng/khu", room.floor || "")}${selectField("status", "Tr\u1ea1ng th\u00e1i", [["\u0110ang hi\u1ec3n th\u1ecb", "\u0110ang hi\u1ec3n th\u1ecb"], ["\u0110ang \u1ea9n", "\u0110ang \u1ea9n"], ["B\u1ea3o tr\u00ec", "B\u1ea3o tr\u00ec"]], room.hidden ? "\u0110ang \u1ea9n" : (room.status || "\u0110ang hi\u1ec3n th\u1ecb"))}
    ${field("weekdayPrice", "Gi\u00e1 ng\u00e0y th\u01b0\u1eddng", room.weekdayPrice || 0, false, "number")}${field("weekendPrice", "Gi\u00e1 cu\u1ed1i tu\u1ea7n", room.weekendPrice || 0, false, "number")}
    ${field("holidayPrice", "Gi\u00e1 ng\u00e0y l\u1ec5/T\u1ebft", room.holidayPrice || 0, false, "number")}
    <label class="permission-item full"><input type="checkbox" name="hidden" value="yes" ${room.hidden ? "checked" : ""}><span><strong>\u1ea8n ph\u00f2ng kh\u1ecfi timeline/\u0111\u1eb7t ph\u00f2ng</strong><small>D\u00f9ng khi ph\u00f2ng b\u1ea3o tr\u00ec ho\u1eb7c t\u1ea1m ng\u01b0ng b\u00e1n.</small></span></label>
    <div class="field full"><label>Ghi ch\u00fa</label><textarea name="note">${room.note || ""}</textarea></div>
  </div>`;
}

function upsertRoom(db, data, id) {
  if (!Array.isArray(db.rooms)) db.rooms = defaultRoomCatalog();
  if (db.rooms.some((room) => room.id !== id && room.hotelId === data.hotelId && String(room.code || "").toLowerCase() === String(data.code || "").toLowerCase())) {
    showToast("M\u00e3 ph\u00f2ng \u0111\u00e3 t\u1ed3n t\u1ea1i trong kh\u00e1ch s\u1ea1n n\u00e0y.");
    throw new Error("Duplicate room code");
  }
  const payload = {
    ...data,
    capacity: +data.capacity,
    weekdayPrice: +data.weekdayPrice,
    weekendPrice: +data.weekendPrice,
    holidayPrice: +data.holidayPrice,
    hidden: data.hidden === "yes" || data.status === "\u0110ang \u1ea9n"
  };
  if (id) Object.assign(db.rooms.find((room) => room.id === id), payload);
  else db.rooms.push({ id: uid("ROOM"), ...payload });
}

function toggleRoomVisibility(id) {
  mutateDb((db) => {
    const room = (db.rooms || []).find((item) => item.id === id);
    if (room) {
      room.hidden = !room.hidden;
      room.status = room.hidden ? "\u0110ang \u1ea9n" : "\u0110ang hi\u1ec3n th\u1ecb";
    }
    return { record: room?.code || id };
  }, "C\u1eadp nh\u1eadt hi\u1ec3n th\u1ecb ph\u00f2ng");
}

function deleteRoom(id) {
  const db = getDb();
  const room = (db.rooms || []).find((item) => item.id === id);
  const hasBooking = (db.hotelBookings || []).some((booking) => booking.room === room?.code && booking.status !== "\u0110\u00e3 h\u1ee7y");
  if (hasBooking) {
    showToast("Ph\u00f2ng \u0111ang c\u00f3 l\u1ecbch \u0111\u1eb7t. H\u00e3y \u1ea9n ph\u00f2ng thay v\u00ec x\u00f3a.");
    return;
  }
  mutateDb((nextDb) => {
    nextDb.rooms = (nextDb.rooms || []).filter((item) => item.id !== id);
    return { record: room?.code || id };
  }, "X\u00f3a ph\u00f2ng");
}

function hotelServicesView() { return bookingSimpleListView("D\u1ecbch v\u1ee5", "Qu\u1ea3n l\u00fd d\u1ecbch v\u1ee5 b\u00e1n k\u00e8m \u0111\u1eb7t ph\u00f2ng.", ["D\u1ecbch v\u1ee5", "Nh\u00f3m", "Tr\u1ea1ng th\u00e1i"], [["Thu\u00ea xe m\u00e1y", "Di chuy\u1ec3n", "\u0110ang \u00e1p d\u1ee5ng"], ["Tour 3 \u0111\u1ea3o", "Tour", "\u0110ang \u00e1p d\u1ee5ng"], ["BBQ H\u1ea3i s\u1ea3n", "\u0102n u\u1ed1ng", "\u0110ang \u00e1p d\u1ee5ng"]]); }
function bookingTransportView() { return bookingSimpleListView("\u0110\u1eb7t xe", "Theo d\u00f5i d\u1ecbch v\u1ee5 thu\u00ea xe g\u1eafn v\u1edbi t\u1eebng \u0111\u1eb7t ph\u00f2ng.", ["D\u1ecbch v\u1ee5", "Ng\u00e0y", "S\u1ed1 l\u01b0\u1ee3ng"], bookingSeedData().services.filter((item) => item.name.includes("xe")).map((item) => [item.name, item.date, item.qty])); }
function bookingToursView() { return bookingSimpleListView("Tour", "Qu\u1ea3n l\u00fd tour, l\u1ecbch kh\u1edfi h\u00e0nh v\u00e0 s\u1ed1 kh\u00e1ch \u0111\u00e3 \u0111\u1eb7t.", ["Tour", "Ng\u00e0y", "S\u1ed1 kh\u00e1ch"], [["Tour 3 \u0111\u1ea3o", "17/06/2025", "4 kh\u00e1ch"], ["L\u1eb7n ng\u1eafm san h\u00f4", "18/06/2025", "8 kh\u00e1ch"], ["C\u00e2u m\u1ef1c \u0111\u00eam", "20/06/2025", "6 kh\u00e1ch"]]); }
function bookingFoodView() { return bookingSimpleListView("BBQ - \u0102n u\u1ed1ng", "Qu\u1ea3n l\u00fd BBQ, su\u1ea5t \u0103n, menu v\u00e0 s\u1ed1 l\u01b0\u1ee3ng kh\u00e1ch theo \u0111\u1eb7t ph\u00f2ng.", ["D\u1ecbch v\u1ee5", "Ng\u00e0y", "S\u1ed1 l\u01b0\u1ee3ng"], [["BBQ H\u1ea3i s\u1ea3n", "18/06/2025", "4 kh\u00e1ch"], ["B\u1eefa s\u00e1ng", "16/06 - 19/06", "12 su\u1ea5t"], ["Set c\u01a1m \u0111o\u00e0n", "22/06/2025", "20 su\u1ea5t"]]); }
function bookingSimpleListView(title, subtitle, headers, rows) { return `<section class="booking-page">${pageHeader(title, subtitle, `<button class="primary">+ Th\u00eam m\u1edbi</button>`)}<div class="booking-simple-grid">${rows.map((row) => `<div class="booking-simple-card"><span>${navIcon("bookingTimeline")}</span><div>${row.map((cell, index) => index === 0 ? `<strong>${cell}</strong>` : `<small>${headers[index]}: ${cell}</small>`).join("")}</div></div>`).join("")}</div><div class="table-wrap"><table><thead><tr>${headers.map((head) => `<th>${head}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div></section>`; }

function motorbikesView() {
  const db = getDb();
  const { rows, allRows } = filteredMotorbikeRows(db);
  const stats = motorbikeStats(allRows, db);
  const bikeTypeOptions = motorbikeTypeOptions(db);
  return `
    <section class="motorbike-page">
      <div class="motorbike-hero">
        <div class="motorbike-title">
          <span class="motorbike-title-icon">♞</span>
          <div><h2>Quản lý xe máy</h2><p>Tìm kiếm, lọc, xem chi tiết và cập nhật đội xe dễ dàng</p></div>
        </div>
        ${canAny(["manage"]) ? `<button class="primary motorbike-add" data-modal="bike">+ Thêm xe</button>` : ""}
      </div>

      <div class="motorbike-stats">
        ${motorbikeStatCard("♨", "Tổng số xe", stats.total, "Tất cả", "mint")}
        ${motorbikeStatCard("✓", "Có sẵn", stats.available, "Sẵn sàng cho thuê", "green")}
        ${motorbikeStatCard("♞", "Đang thuê", stats.renting, "Đang sử dụng", "blue")}
        ${motorbikeStatCard("⌘", "Đang sửa", stats.repairing, "Đang sửa chữa", "orange")}
        ${motorbikeStatCard("◷", "Quá hạn", stats.overdue, "Cần xử lý", "red")}
        ${motorbikeStatCard("●", "Chủ xe", stats.ownerCount, `${stats.ownedBikeCount} xe có chủ`, "purple")}
      </div>
      ${motorbikeOwnerSummary(db)}

      <div class="motorbike-panel">
        <div class="motorbike-filters">
          <label class="search-box"><input type="search" placeholder="Tìm kiếm (biển số, tên xe, chủ xe...)" value="${state.query}" data-filter="query"><span>⌕</span></label>
          <select data-filter="status"><option value="all">Tất cả trạng thái</option>${bikeStatuses.map((status) => `<option value="${status}" ${state.filter === status ? "selected" : ""}>${status}</option>`).join("")}</select>
          <select data-bike-filter="type"><option value="all">Tất cả loại xe</option>${bikeTypeOptions.map((type) => `<option value="${type}" ${state.bikeFilters.type === type ? "selected" : ""}>${type}</option>`).join("")}</select>
          <select data-bike-filter="owner"><option value="all">Tất cả chủ xe</option>${db.owners.filter((owner) => !owner.hidden).map((owner) => `<option value="${owner.id}" ${state.bikeFilters.owner === owner.id ? "selected" : ""}>${owner.name}</option>`).join("")}</select>
          <select data-bike-sort><option value="code-asc" ${state.bikeFilters.sort === "code-asc" ? "selected" : ""}>↕ Sắp xếp: Mã xe</option><option value="code-desc" ${state.bikeFilters.sort === "code-desc" ? "selected" : ""}>Mã xe giảm dần</option><option value="name-asc" ${state.bikeFilters.sort === "name-asc" ? "selected" : ""}>Tên xe A-Z</option><option value="price-desc" ${state.bikeFilters.sort === "price-desc" ? "selected" : ""}>Giá thuê cao nhất</option></select>
          <button class="ghost square-action" data-action="reset-bike-filters" title="Làm mới bộ lọc">⟳</button>
          <button class="secondary export-bike-btn" data-action="export-bikes-excel">⇩ Xuất Excel</button>
        </div>
        <div class="table-wrap motorbike-table-wrap"><table class="motorbike-table">
          <thead><tr><th>Xe</th><th>Thông tin xe</th><th>Chủ xe</th><th>Giá thuê</th><th>Bảo trì tiếp theo</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>${rows.map((bike) => motorbikeModernRow(bike, db)).join("") || `<tr><td colspan="7" class="empty">Không có xe phù hợp.</td></tr>`}</tbody>
        </table></div>
        <div class="motorbike-footer"><span>Hiển thị ${rows.length ? `1 - ${rows.length}` : "0"} trong ${allRows.length} xe</span><div class="pager"><button disabled>‹</button><button class="active">1</button><button>2</button><button>3</button><button>›</button></div></div>
      </div>
    </section>
  `;
}

function motorbikeTypeOptions(db = getDb()) {
  const names = [
    ...(db.bikeTypes || []).map((type) => type.name),
    ...(db.motorbikes || []).map((bike) => bike.type)
  ].filter(Boolean);
  return [...new Set(names)].sort((a, b) => String(a).localeCompare(String(b), "vi", { numeric: true }));
}

function filteredMotorbikeRows(db = getDb()) {
  const query = state.query.trim().toLowerCase();
  const allRows = db.motorbikes.map((bike) => ({ bike, owner: db.owners.find((owner) => owner.id === bike.ownerId) }));
  const rows = allRows.filter(({ bike, owner }) => {
    const matchesQuery = !query || [bike.code, bike.plate, bike.name, bike.type, bike.brand, bike.model, bike.color, owner?.name, owner?.phone].some((value) => String(value || "").toLowerCase().includes(query));
    const matchesStatus = state.filter === "all" || bike.status === state.filter;
    const matchesType = state.bikeFilters.type === "all" || bike.type === state.bikeFilters.type;
    const matchesOwner = state.bikeFilters.owner === "all"
      || (state.bikeFilters.owner === "missing" ? !bike.ownerId : bike.ownerId === state.bikeFilters.owner);
    return matchesQuery && matchesStatus && matchesType && matchesOwner;
  }).map((row) => row.bike);
  rows.sort((a, b) => {
    if (state.bikeFilters.sort === "code-desc") return String(b.code).localeCompare(String(a.code), "vi", { numeric: true });
    if (state.bikeFilters.sort === "name-asc") return String(a.name).localeCompare(String(b.name), "vi", { numeric: true });
    if (state.bikeFilters.sort === "price-desc") return Number(b.weekdayPrice || 0) - Number(a.weekdayPrice || 0);
    return String(a.code).localeCompare(String(b.code), "vi", { numeric: true });
  });
  return { rows, allRows: allRows.map((row) => row.bike) };
}

function motorbikeStats(rows, db = getDb()) {
  return {
    total: rows.length,
    available: rows.filter((bike) => bike.status === "Có sẵn").length,
    renting: rows.filter((bike) => bike.status === "Đang thuê").length,
    repairing: rows.filter((bike) => ["Đang sửa", "Chờ phụ tùng", "Chờ kiểm tra", "Hư hỏng"].includes(bike.status)).length,
    overdue: rows.filter((bike) => bike.status === "Quá hạn" || isBikeKmDue(bike)).length,
    ownerCount: db.owners.filter((owner) => !owner.hidden).length,
    ownedBikeCount: rows.filter((bike) => bike.ownerId).length
  };
}

function motorbikeStatCard(icon, label, value, caption, tone) {
  return `<div class="motorbike-stat"><span class="stat-icon ${tone}">${icon}</span><div><small>${label}</small><strong>${String(value).padStart(2, "0")}</strong><em>${caption}</em></div></div>`;
}

function motorbikeOwnerSummary(db = getDb()) {
  const rows = db.owners.filter((owner) => !owner.hidden).map((owner) => {
    const bikes = db.motorbikes.filter((bike) => bike.ownerId === owner.id);
    return { owner, bikes };
  }).sort((a, b) => b.bikes.length - a.bikes.length || a.owner.name.localeCompare(b.owner.name, "vi"));
  const noOwner = db.motorbikes.filter((bike) => !bike.ownerId);
  const content = rows.map(({ owner, bikes }) => `
    <button class="owner-summary-card" type="button" data-bike-filter-owner="${owner.id}">
      <span class="owner-summary-icon">●</span>
      <strong>${owner.name}</strong>
      <em>${bikes.length} chiếc xe</em>
      <small>${bikes.map((bike) => bike.code).join(", ") || "Chưa có xe"}</small>
    </button>
  `).join("");
  const missing = noOwner.length ? `
    <button class="owner-summary-card warning" type="button" data-bike-filter-owner="missing">
      <span class="owner-summary-icon">!</span>
      <strong>Chưa gắn chủ</strong>
      <em>${noOwner.length} chiếc xe</em>
      <small>${noOwner.map((bike) => bike.code).join(", ")}</small>
    </button>
  ` : "";
  return `<div class="owner-summary-panel">
    <div class="owner-summary-title"><strong>Xe theo từng chủ</strong><span>Bấm vào tên chủ để lọc nhanh danh sách xe</span></div>
    <div class="owner-summary-list">${content || `<span class="empty">Chưa có chủ xe.</span>`}${missing}</div>
  </div>`;
}

function motorbikeModernRow(bike, db) {
  const owner = db.owners.find((item) => item.id === bike.ownerId);
  const adminDelete = isSuperAdmin() ? `<button class="danger motorbike-delete" type="button" data-action="delete-bike:${bike.id}">\u00d7 X\u00f3a</button>` : "";
  return `<tr>
    <td>${motorbikePhotoCode(bike)}</td>
    <td><strong class="bike-name">${bike.name}</strong><span class="bike-sub">${bike.brand || ""} ${bike.model || ""} · ${bike.color || ""}</span><span class="plate-badge">${bike.plate}</span></td>
    <td><div class="owner-cell"><span class="owner-icon">●</span><div><strong>${owner?.name || "Chưa có chủ"}</strong><span>${owner?.type || bike.ownership || ""}</span><span>${owner?.phone || ""}</span></div></div></td>
    <td><strong>${money(bike.weekdayPrice)}</strong><span class="price-line">Giờ: ${money(Math.round(Number(bike.weekdayPrice || 0) / 3))}</span><span class="price-line">Ngày: ${money(bike.weekendPrice || bike.weekdayPrice)}</span></td>
    <td><div class="maintenance-cell"><strong>▣ ${formatDate(bike.nextMaintenance)}</strong><span>${oilHint(bike)}</span></div></td>
    <td>${motorbikeStatusBlock(bike)}</td>
    <td><div class="motorbike-actions"><button class="secondary" data-modal="bikeDetail:${bike.id}">◎ Chi tiết</button><button class="ghost icon-only" data-modal="bike:${bike.id}">⋮</button>${adminDelete}</div></td>
  </tr>`;
}

function motorbikePhotoCode(bike) {
  const images = Array.isArray(bike.images) ? bike.images.filter(Boolean).slice(0, 5) : [];
  const image = images[0] || "";
  const photo = image
    ? `<div class="bike-photo-hover main" tabindex="0"><img src="${image}" alt="${bike.name}"><div class="bike-photo-zoom"><img src="${image}" alt="${bike.name} ph\u00f3ng to"></div></div>`
    : `<div class="bike-photo-empty">XE</div>`;
  const thumbs = images.slice(1).map((src, index) => `<div class="bike-photo-hover thumb" tabindex="0"><img src="${src}" alt="${bike.name} hình ${index + 2}"><div class="bike-photo-zoom"><img src="${src}" alt="${bike.name} hình ${index + 2} phóng to"></div></div>`).join("");
  const more = Array.isArray(bike.images) && bike.images.length > 5 ? `<em>+${bike.images.length - 5}</em>` : "";
  return `<div class="bike-photo-code"><div class="bike-photo-stack">${photo}<div class="bike-photo-strip">${thumbs}${more}</div></div><span>${String(bike.code || "").replace(/^[^0-9]*/, "") || bike.code}</span></div>`;
}

function motorbikeStatusBlock(bike) {
  const due = isBikeKmDue(bike);
  const label = due && bike.status === "Có sẵn" ? "Sắp đến hạn" : bike.status;
  const detail = bike.status === "Đang thuê" ? "Khách thuê" : due ? oilHint(bike).replace(/^.*?:?\s*/, "") : statusCaption(bike.status);
  return `<div class="status-stack">${pill(label)}<span>${detail}</span></div>`;
}

function statusCaption(status) {
  if (status === "Có sẵn") return "Sẵn sàng";
  if (status === "Đang sửa") return "Đang sửa chữa";
  if (status === "Quá hạn") return "Cần xử lý";
  if (status === "Hư hỏng") return "Thay nhớt";
  return status;
}

function bikeTypesView() {
  const db = getDb();
  const rows = filterRows(db.bikeTypes || [], ["name", "checklist", "note"]);
  const dueTypes = rows.filter((type) => db.motorbikes.some((bike) => bike.type === type.name && isBikeKmDue(bike))).length;
  const totalMaintenanceCycles = rows.reduce((sum, type) => sum + (Number(type.maintenanceIntervalKm || 0) > 0 ? 1 : 0), 0);
  return `
    <section class="bike-type-page">
      <div class="bike-type-hero">
        <div class="bike-type-title">
          <span class="bike-type-title-icon">♞</span>
          <div><h2>Loại xe</h2><p>Quản lý các loại xe và thông tin kiểm tra, bảo trì định kỳ.</p></div>
        </div>
        ${can("manage") ? `<button class="primary bike-type-add" data-modal="bikeType">+ Th\u00eam lo\u1ea1i xe</button>` : ""}
      </div>
      <div class="bike-type-panel">
        <div class="bike-type-toolbar">
          <label class="search-box bike-type-search"><input type="search" placeholder="Tìm kiếm loại xe..." value="${state.query}" data-filter="query"><span>⌕</span></label>
          <span class="bike-type-hint">ⓘ Có tìm kiếm, lọc, sắp xếp và phân trang rút gọn theo màn hình.</span>
        </div>
        <div class="bike-type-stats">
          ${bikeTypeStat("♞", "Tổng loại xe", rows.length, "Loại xe", "blue")}
          ${bikeTypeStat("▣", "Sắp tới bảo trì", dueTypes, "Loại xe cần chú ý", "green")}
          ${bikeTypeStat("⚒", "Tổng kỳ bảo trì", totalMaintenanceCycles, "Lịch bảo trì định kỳ", "orange")}
          ${bikeTypeStat("▱", "Đang áp dụng", rows.filter((type) => db.motorbikes.some((bike) => bike.type === type.name)).length, "Loại xe", "purple")}
        </div>
        <div class="table-wrap bike-type-table-wrap"><table class="bike-type-table">
          <thead><tr><th>Loại xe</th><th>💧 Thay nhớt</th><th>▣ Bảo trì định kỳ</th><th>▤ Checklist bảo trì</th><th>▧ Ghi chú</th><th>Thao tác</th></tr></thead>
          <tbody>${rows.map((type, index) => bikeTypeModernRow(type, db, index)).join("") || `<tr><td colspan="6" class="empty">Chưa có loại xe.</td></tr>`}</tbody>
        </table></div>
        <div class="motorbike-footer"><span>Hiển thị ${rows.length ? `1 - ${rows.length}` : "0"} trong ${rows.length} loại xe</span><div class="pager"><button disabled>‹</button><button class="active">1</button><button disabled>›</button></div></div>
      </div>
    </section>
  `;
}

function bikeTypeStat(icon, label, value, caption, tone) {
  return `<div class="bike-type-stat"><span class="type-stat-icon ${tone}">${icon}</span><div><small>${label}</small><strong>${value}</strong><em>${caption}</em></div></div>`;
}

function bikeTypeModernRow(type, db, index) {
  const tone = ["green", "blue", "teal", "orange"][index % 4];
  const applied = db.motorbikes.filter((bike) => bike.type === type.name);
  const checklist = String(type.checklist || "").split(",").map((item) => item.trim()).filter(Boolean);
  return `<tr class="type-row-${tone}">
    <td><div class="type-name-cell"><span class="type-illustration ${tone}">${bikeTypeIcon(type.name)}</span><div><strong>${type.name}</strong><em>${applied.length ? "Phổ biến" : "Khác"}</em></div></div></td>
    <td>${bikeTypeKmCell(type.oilChangeIntervalKm, "Đề xuất", tone, Number(type.oilChangeIntervalKm || 0) > 0 ? 38 : 0, Number(type.oilChangeIntervalKm || 0) > 0 ? "💧" : "♢")}</td>
    <td>${bikeTypeKmCell(type.maintenanceIntervalKm, "Định kỳ", tone, 78, "▣")}</td>
    <td><div class="type-checklist">${checklist.slice(0, 3).map((item) => `<span><i>✓</i>${item}</span>`).join("")}${checklist.length > 3 ? `<b>+${checklist.length - 3} mục khác</b>` : ""}</div></td>
    <td>${bikeTypeNote(type, applied)}</td>
    <td><div class="type-actions"><button class="secondary" data-modal="bikeType:${type.id}">◎ Chi tiết</button>${can("manage") ? `<button class="ghost" data-modal="bikeType:${type.id}">✎ Sửa</button>` : ""}</div></td>
  </tr>`;
}

function bikeTypeKmCell(value, caption, tone, percent, icon) {
  const km = Number(value || 0);
  return `<div class="type-km-cell"><strong><span>${icon}</span> ${km ? `${km.toLocaleString("vi-VN")} km` : "0 km"}</strong><div class="type-progress ${tone}"><i style="width:${Math.max(0, Math.min(100, percent))}%"></i></div><em>${km ? caption : "Không áp dụng"}</em></div>`;
}

function bikeTypeNote(type, applied) {
  if (applied.length) return `<div class="type-note"><span>▧ Áp dụng cho:</span><strong>${applied.map((bike) => bike.model || bike.name).slice(0, 3).join(", ")}</strong></div>`;
  return `<div class="type-note muted"><span>ⓘ Chú ý:</span><strong>${type.note || "Chưa có xe áp dụng"}</strong></div>`;
}

function bikeTypeIcon(name) {
  if (String(name).toLowerCase().includes("điện")) return "🛵";
  if (String(name).toLowerCase().includes("số")) return "🏍";
  return "🛵";
}


function rentalsView() {
  const db = getDb();
  const rows = filteredRentalRows(db);
  const stats = rentalStats(db.rentals);
  return `
    <section class="rental-page">
      <div class="rental-hero">
        <div class="rental-title">
          <span class="rental-title-icon">♢</span>
          <div><h2>Thuê & trả xe</h2><p>Tạo đặt xe, giao xe, trả xe, chụp ảnh và tự động tạo phiếu sửa nếu phát hiện hư hỏng.</p></div>
        </div>
        ${canAny(["rentals", "manage"]) ? `<button class="primary rental-add" data-modal="rental">+ Tạo phiếu thuê</button>` : ""}
      </div>

      <div class="rental-stats">
        ${rentalStatCard("▤", "Tổng phiếu", stats.total, "phiếu", "green")}
        ${rentalStatCard("♙", "Đang thuê", stats.active, "phiếu", "blue")}
        ${rentalStatCard("◷", "Quá hạn", stats.overdue, "phiếu", "orange")}
        ${rentalStatCard("✓", "Đã trả", stats.returned, "phiếu", "purple")}
        ${rentalStatCard("$", "Doanh thu hôm nay", money(stats.todayRevenue), "", "money")}
      </div>

      <div class="rental-panel">
        <div class="rental-filters">
          <label class="search-box rental-search"><input type="search" placeholder="Tìm kiếm phiếu, khách, xe..." value="${state.query}" data-filter="query"><span>⌕</span></label>
          <select data-filter="status"><option value="all">Tất cả trạng thái</option>${rentalStatuses.map((status) => `<option value="${status}" ${state.filter === status ? "selected" : ""}>${status}</option>`).join("")}</select>
          <label class="rental-date-filter"><span>◔</span><input type="date" value="${state.rentalDate || ""}" data-rental-date><em>Chọn khoảng thời gian</em></label>
          <button class="secondary rental-export" data-action="export-rentals-excel">⇩ Xuất Excel</button>
        </div>
        <div class="table-wrap rental-table-wrap"><table class="rental-table">
          <thead><tr><th>Phiếu thuê</th><th>Khách hàng</th><th>Ảnh xe</th><th>Xe</th><th>Thời gian thuê</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>${rows.map((r) => rentalModernRow(r, db)).join("") || `<tr><td colspan="8" class="empty">KhKhông có phiếu thuê phù hợp.</td></tr>`}</tbody>
        </table></div>
        <div class="rental-footer"><span>Hiển thị ${rows.length ? `1 - ${rows.length}` : "0"} trong ${rows.length} phiếu thuê</span><div class="rental-pager"><button disabled>‹</button><button class="active">1</button><button disabled>›</button><select><option>10 / trang</option></select></div></div>
      </div>

      <div class="rental-note"><span>ⓘ</span><p><strong>Lưu ý:</strong><br>Khi trả xe, chỉ cần nhập km và chụp ảnh. Hệ thống tự ghi nhận thanh toán đủ và đưa xe về trạng thái có sẵn.</p></div>
    </section>
  `;
}

function filteredRentalRows(db = getDb()) {
  const query = state.query.trim().toLowerCase();
  return db.rentals.filter((rental) => {
    const bike = db.motorbikes.find((bike) => bike.id === rental.bikeId);
    const matchesQuery = !query || [rental.code, rental.customer, rental.phone, rental.room, rental.status, bike?.code, bike?.name, bike?.plate].some((value) => String(value || "").toLowerCase().includes(query));
    const matchesStatus = state.filter === "all" || rental.status === state.filter;
    const matchesDate = !state.rentalDate || rental.start.slice(0, 10) === state.rentalDate || rental.end.slice(0, 10) === state.rentalDate;
    return matchesQuery && matchesStatus && matchesDate;
  }).sort((a, b) => new Date(b.start) - new Date(a.start));
}

function rentalStats(rows) {
  const today = todayISO();
  return {
    total: rows.length,
    active: rows.filter((r) => r.status === "Đang thuê").length,
    overdue: rows.filter((r) => r.status === "Quá hạn").length,
    returned: rows.filter((r) => r.status === "Đã trả").length,
    todayRevenue: rows.filter((r) => r.start.slice(0, 10) === today || r.end.slice(0, 10) === today).reduce((sum, r) => sum + Number(r.paid || 0), 0)
  };
}

function rentalStatCard(icon, label, value, caption, tone) {
  return `<div class="rental-stat ${tone}"><span>${icon}</span><div><small>${label}</small><strong>${value}</strong>${caption ? `<em>${caption}</em>` : ""}</div></div>`;
}

function rentalModernRow(r, db = getDb()) {
  const bike = db.motorbikes.find((b) => b.id === r.bikeId);
  const remain = Math.max(0, Number(r.total || 0) - Number(r.paid || 0));
  const hours = rentalHours(r);
  return `<tr>
    <td><div class="rental-code-cell"><span>▤</span><div><strong>${r.code}</strong>${remain > 0 ? `<em>⚠ Chưa thanh toán</em>` : `<em class="paid">Đã thanh toán</em>`}<small>Tạo lúc: ${formatDateTime(r.createdAt || r.start)}</small></div></div></td>
    <td><div class="rental-customer"><span>●</span><div><strong>${r.customer}</strong><small>${r.phone}</small><small>Phòng ${r.room}</small></div></div></td>
    <td>${r.beforePhoto ? `<img class="rental-photo" src="${r.beforePhoto}" alt="Ảnh xe">` : bike ? rentalBikeImage(bike) : "-"}</td>
    <td><strong class="rental-bike-code">${bike?.code?.replace(/^[^0-9]*/, "") || bike?.code || "-"}</strong><span class="rental-bike-name">${bike?.name || ""}</span><span class="plate-badge">${bike?.plate || ""}</span></td>
    <td><div class="rental-time"><strong>▣ ${formatDateTime(r.start)}</strong><strong>đến ${formatDateTime(r.end)}</strong><em>◷ ${hours} giờ</em></div></td>
    <td><strong class="rental-paid">${money(r.paid)}</strong><span>Còn ${money(remain)}</span></td>
    <td><div class="rental-status-cell">${pill(r.status)}<span>${r.status === "Quá hạn" ? overdueText(r) : rentalStatusText(r.status)}</span></div></td>
    <td>${rentalActions(r)}</td>
  </tr>`;
}

function rentalBikeImage(bike) {
  const image = Array.isArray(bike.images) ? bike.images[0] : "";
  return image ? `<img class="rental-photo" src="${image}" alt="${bike.name}">` : `<div class="rental-photo empty">XE</div>`;
}

function rentalHours(rental) {
  const diff = new Date(rental.end) - new Date(rental.start);
  return Math.max(1, Math.round(diff / 3600000));
}

function overdueText(rental) {
  const diff = Math.max(0, Date.now() - new Date(rental.end).getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return hours ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
}

function rentalStatusText(status) {
  if (status === "Đang thuê") return "Khách đang sử dụng";
  if (status === "Đã đặt") return "Chờ giao xe";
  if (status === "Đã trả") return "Hoàn thành";
  if (status === "Chưa thanh toán đủ") return "Cần thu thêm";
  if (status === "Đã hủy") return "Phiếu đã hủy";
  return status;
}

function rentalActions(r) {
  const canCancel = can("manage") && !["Đã trả", "Đã hủy"].includes(r.status);
  return `<div class="rental-actions">
    ${["Đang thuê", "Quá hạn"].includes(r.status) && canAny(["rentals", "manage"]) ? `<button class="primary" data-modal="return:${r.id}">♢ Trả xe</button>` : ""}
    ${r.status === "Đã đặt" && canAny(["rentals", "manage"]) ? `<button class="primary" data-action="handover:${r.id}">♢ Giao xe</button>` : ""}
    ${canCancel ? `<button class="danger" data-action="cancel-rental:${r.id}">Hủy thuê</button>` : ""}
    <button class="ghost" data-modal="return:${r.id}">▣ Ảnh xe</button>
    <button class="ghost" data-modal="rental:${r.id}">✎ Sửa</button>
    <button class="ghost icon-only" data-modal="rental:${r.id}">⋮</button>
  </div>`;
}


function rentalCalendarView() {
  const db = getDb();
  const rows = [...db.rentals].sort((a, b) => new Date(a.start) - new Date(b.start));
  const today = todayISO();
  const weekEnd = todayISO(6);
  const todayRows = rows.filter((r) => rentalTouchesDate(r, today));
  const weekRows = rows.filter((r) => r.start.slice(0, 10) >= today && r.start.slice(0, 10) <= weekEnd && !rentalTouchesDate(r, today));
  const activeRows = rows.filter((r) => ["Đang thuê", "Quá hạn"].includes(r.status));
  const completedRows = rows.filter((r) => r.status === "Đã trả");
  return `
    <section class="calendar-page">
      <div class="calendar-hero">
        <div class="calendar-title">
          <span class="calendar-title-icon">▦</span>
          <div><h2>Lịch thuê xe</h2><p>Timeline ngày, tuần, tháng rút gọn cho đội lễ tân theo dõi lịch giao và trả xe.</p></div>
        </div>
        <div class="calendar-controls">
          <button class="calendar-range">▣ ${formatDate(today)} - ${formatDate(weekEnd)}⌄</button>
          <div class="calendar-tabs"><button>Ngày</button><button class="active">Tuần</button><button>Tháng</button></div>
          <button class="ghost calendar-filter">▽ Bộ lọc</button>
        </div>
      </div>
      <div class="calendar-stats">
        ${calendarStat("▰", "Hôm nay", todayRows.length, "lịch giao/trả", "teal")}
        ${calendarStat("▣", "7 ngày tới", rows.filter((r) => r.start.slice(0, 10) >= today && r.start.slice(0, 10) <= weekEnd).length, "lịch giao/trả", "green")}
        ${calendarStat("◷", "Đang diễn ra", activeRows.length, "lịch thuê", "orange")}
        ${calendarStat("✓", "Đã hoàn thành", completedRows.length, "lịch thuê", "blue")}
      </div>
      ${calendarTimelineSection("Hôm nay", today, todayRows, true)}
      ${calendarTimelineSection("7 ngày tới", "", weekRows.slice(0, 5), false)}
    </section>
  `;
}

function rentalTouchesDate(rental, date) {
  return rental.start.slice(0, 10) === date || rental.end.slice(0, 10) === date || (new Date(rental.start) <= new Date(`${date}T23:59`) && new Date(rental.end) >= new Date(`${date}T00:00`));
}

function calendarStat(icon, label, value, caption, tone) {
  return `<div class="calendar-stat"><span class="${tone}">${icon}</span><div><small>${label}</small><strong>${value}</strong><em>${caption}</em></div></div>`;
}

function calendarTimelineSection(title, dateLabel, rows, compactDate) {
  return `<div class="calendar-section">
    <div class="calendar-section-head"><h3><span>▣</span>${title}${dateLabel ? ` - ${formatDate(dateLabel)}` : ""}</h3><em>${rows.length} lịch giao/trả</em></div>
    <div class="calendar-timeline">${rows.length ? rows.map((r) => calendarTimelineRow(r, compactDate)).join("") : `<div class="empty">Không có lịch trong khoảng này.</div>`}</div>
    ${!compactDate && rows.length ? `<div class="calendar-more"><button class="ghost">Xem thêm⌄</button></div>` : ""}
  </div>`;
}

function calendarTimelineRow(r, compactDate) {
  const db = getDb();
  const bike = db.motorbikes.find((b) => b.id === r.bikeId);
  const action = calendarActionLabel(r);
  const time = new Date(r.start).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `<div class="calendar-row">
    <div class="calendar-day">${compactDate ? `<span></span>` : `<strong>${formatDate(r.start).slice(0, 5)}</strong><small>${weekdayLabel(r.start)}</small>`}</div>
    <div class="calendar-line"><i></i><b></b></div>
    <time>${time}</time>
    <div class="calendar-ticket"><strong>${r.code} · ${bike?.code || ""}</strong><em>${action}</em></div>
    <div class="calendar-customer"><span>♙</span><div><strong>${r.customer}</strong><small>SĐT: ${r.phone}</small></div></div>
    <div class="calendar-bike">${r.beforePhoto ? `<img src="${r.beforePhoto}" alt="Ảnh xe">` : bike ? rentalBikeImage(bike) : ""}<div><strong>${bike?.name || ""}</strong><small>${bike?.plate || ""}</small></div></div>
    <div class="calendar-duration"><span>◷</span><div><strong>${rentalHours(r)} giờ</strong><small>${shortDateTime(r.start)} → ${shortDateTime(r.end)}</small></div></div>
    <div class="calendar-status">${pill(calendarStatusLabel(r))}</div>
    <button class="ghost icon-only" data-modal="rental:${r.id}">⋮</button>
  </div>`;
}

function calendarActionLabel(rental) {
  if (["Đang thuê", "Quá hạn"].includes(rental.status)) return "Trả xe";
  return "Giao xe";
}

function calendarStatusLabel(rental) {
  if (rental.status === "Đang thuê") return "Đang diễn ra";
  if (rental.status === "Đã trả") return "Đã trả";
  if (rental.status === "Quá hạn") return "Sắp trả";
  return rental.status;
}

function weekdayLabel(dateValue) {
  const days = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return days[new Date(dateValue).getDay()];
}

function shortDateTime(value) {
  const date = new Date(value);
  return `${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function calendarItem(r) {
  const bike = getDb().motorbikes.find((b) => b.id === r.bikeId);
  return `<div class="timeline-item"><strong>${r.code} · ${bike?.code || ""}</strong><span>${r.customer} - ${r.room}</span><span class="hint">${formatDateTime(r.start)} đến ${formatDateTime(r.end)} · ${r.status}</span></div>`;
}


function ticketsView(assetType) {
  const db = getDb();
  const rows = filterRows(db.tickets.filter((t) => t.assetType === assetType), ["code", "issue", "priority", "status"]);
  return `
    ${pageHeader(`Sửa chữa và bảo trì ${assetType === "Xe máy" ? "xe" : "thiết bị"}`, "Theo dõi lỗi, chi phí, phụ tùng, ảnh trước/sau và nghiệm thu.", canAny(["maintenance", "manage", "damage"]) ? `<button class="primary" data-modal="ticket:${assetType}">Tạo phiếu</button>` : "")}
    ${assetType === "Xe máy" ? bikeMaintenanceOverview(db) : ""}
    ${assetType === "Thiết bị" ? equipmentMaintenanceOverview(db) : ""}
    ${filters(ticketStatuses)}
    <div class="table-wrap">
      <table>
        <thead><tr><th>Mã phiếu</th><th>Tài sản</th><th>Lỗi</th><th>Ưu tiên</th><th>Chi phí</th><th>Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>${rows.map(ticketRow).join("") || `<tr><td colspan="8" class="empty">KhKhông có phiếu phù hợp.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function bikeMaintenanceOverview(db = getDb()) {
  const rows = db.motorbikes.map((bike) => {
    const tickets = db.tickets.filter((ticket) => ticket.assetType === "Xe máy" && ticket.assetId === bike.id);
    const completedTickets = tickets.filter((ticket) => ticket.status === "Hoàn thành");
    const repairCost = tickets.reduce((sum, ticket) => sum + Number(ticket.actualCost || ticket.estimatedCost || 0), 0);
    const latestTicket = latestBikeTicket(tickets);
    const oilKm = nextOilChangeKm(bike);
    const maintenanceKm = nextMaintenanceKm(bike);
    return { bike, tickets, completedTickets, repairCost, latestTicket, oilKm, maintenanceKm };
  });
  const oilDue = rows.filter((row) => isBikeOilDue(row.bike)).length;
  const maintenanceDue = rows.filter((row) => isBikeMaintenanceKmDue(row.bike)).length;
  const oilDateAlerts = rows.filter((row) => isOilDateAlert(row.bike)).length;
  const repairTotal = rows.reduce((sum, row) => sum + row.tickets.length, 0);
  return `
    <div class="grid cols-4">
      ${metric("Cảnh báo quá 60 ngày", oilDateAlerts)}
      ${metric("Xe đến hạn thay nhớt", oilDue)}
      ${metric("Xe đến hạn bảo trì", maintenanceDue)}
      ${metric("Tổng lần sửa/bảo trì", repairTotal)}
    </div>
    ${oilChangeAlertTable(rows)}
    <div class="maintenance-history-grid">
      ${ticketNotificationPanel(db, "Xe máy")}
      ${ticketHistoryPanel(db, "Xe máy")}
    </div>
    <div class="card">
      <div class="panel-title"><h3>Theo dõi thay nhớt và bảo trì theo km</h3><span class="pill">${rows.length} xe</span></div>
      <div class="table-wrap compact-table"><table>
        <thead><tr><th>Xe</th><th>Km hiện tại</th><th>Thay nhớt</th><th>Bảo trì tổng quát</th><th>Sửa/bảo trì</th><th>Chi phí</th><th>Lần sửa gần nhất</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>${rows.map(({ bike, tickets, completedTickets, repairCost, latestTicket, oilKm, maintenanceKm }) => `
          <tr>
            <td><strong>${bike.code}  · ${bike.name}</strong><br><span class="hint">${bike.plate}  · ${bike.type}</span></td>
            <td>${Number(bike.odometer || 0).toLocaleString("vi-VN")} km</td>
            <td>
              <strong>${oilHint(bike)}</strong><br>
              <span class="hint">Ngày thay: ${formatDate(bike.lastOilChangeDate)} · Lần thay: ${Number(bike.lastOilChangeKm || 0).toLocaleString("vi-VN")} km · Chu kỳ ${Number(bike.oilChangeIntervalKm || 0).toLocaleString("vi-VN")} km · Mốc tới ${Number(oilKm || 0).toLocaleString("vi-VN")} km</span>
            </td>
            <td>
              <strong>${maintenanceKmHint(bike)}</strong><br>
              <span class="hint">Lần bảo trì: ${Number(bike.lastMaintenanceKm || 0).toLocaleString("vi-VN")} km · Chu kỳ ${Number(bike.maintenanceIntervalKm || 0).toLocaleString("vi-VN")} km · Mốc tới ${Number(maintenanceKm || 0).toLocaleString("vi-VN")} km</span>
            </td>
            <td>${tickets.length} phi phiếu<br><span class="hint">HoHoàn thành ${completedTickets.length} l lần</span></td>
            <td>${can("costs") ? money(repairCost) : "<span class='hint'>Ẩn theo quyền</span>"}</td>
            <td>${latestTicket ? `<strong>${formatDate(latestTicket.foundDate || latestTicket.dueDate)}</strong><br><span class="hint">${latestTicket.issue} · ${money(ticketCost(latestTicket))}</span>` : "<span class='hint'>Chưa có</span>"}</td>
            <td>${bikeStatusControl(bike)}</td>
            <td><div class="actions"><button class="secondary" data-modal="bikeDetail:${bike.id}">Chi tiết</button><button class="ghost" data-action="set-bike-status:${bike.id}:Có sẵn">Có sẵn</button><button class="ghost" data-action="set-bike-status:${bike.id}:Đang sửa">Đang sửa</button><button class="ghost" data-action="set-bike-status:${bike.id}:Đang thuê">Đang thuê</button><button class="ghost" data-modal="bikeKm:${bike.id}">Cập nhật km</button><button class="ghost" data-modal="ticket:Xe máy:${bike.id}">Tạo phiếu</button></div></td>
          </tr>`).join("")}</tbody>
      </table></div>
    </div>
  `;
}

function ticketCost(ticket) {
  return Number(ticket?.actualCost || ticket?.estimatedCost || 0);
}

function latestBikeTicket(tickets = []) {
  return [...tickets].sort((a, b) => new Date(b.foundDate || b.createdAt || b.dueDate || 0) - new Date(a.foundDate || a.createdAt || a.dueDate || 0))[0] || null;
}

function oilChangeAlertTable(rows) {
  const allRows = rows
    .map((row) => ({ ...row, days: daysSinceOilChange(row.bike), alert: isOilDateAlert(row.bike) }))
    .filter((row) => row.alert || row.bike.oilAlertEnabled !== false)
    .sort((a, b) => b.days - a.days);
  const paged = paginatePanel(allRows, "oilAlerts", 5);
  return `<div class="card oil-alert-card">
    <div class="panel-title">
      <div><h3>Thông báo cảnh báo thay nhớt quá 60 ngày</h3><span class="hint">Bảng riêng để bật/tắt cảnh báo và cập nhật khi xe đã được thay nhớt.</span></div>
      <span class="pill warning">${allRows.filter((row) => row.alert).length} cảnh báo</span>
    </div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Xe</th><th>Ngày thay nhớt gần nhất</th><th>Số ngày</th><th>Km thay gần nhất</th><th>Cảnh báo</th><th>Trạng thái xử lý</th><th>Thao tác</th></tr></thead>
      <tbody>${paged.rows.map(({ bike, days, alert }) => `<tr class="${alert ? "alert-row" : ""}">
        <td><strong>${bike.code}  · ${bike.name}</strong><br><span class="hint">${bike.plate}</span></td>
        <td>${formatDate(bike.lastOilChangeDate)}</td>
        <td><strong>${days} ngày</strong><br><span class="hint">Ngưỡng cảnh báo: 60 ngày</span></td>
        <td>${Number(bike.lastOilChangeKm || 0).toLocaleString("vi-VN")} km</td>
        <td>${bike.oilAlertEnabled === false ? pill("Tắt") : pill(alert ? "Quá hạn" : "Đang bật")}</td>
        <td>${bike.oilAlertHandled ? pill("Đã xử lý") : pill(alert ? "Cần thay nhớt" : "Đang theo dõi")}</td>
        <td><div class="actions">
          <button class="ghost" data-action="toggle-oil-alert:${bike.id}">${bike.oilAlertEnabled === false ? "Bật cảnh báo" : "Tắt cảnh báo"}</button>
          <button class="secondary" data-action="mark-oil-changed:${bike.id}">Đã thay nhớt</button>
          <button class="ghost" data-modal="bikeKm:${bike.id}">Cập nhật</button>
        </div></td>
      </tr>`).join("") || `<tr><td colspan="7" class="empty">Chưa có xe cần cảnh báo theo ngày thay nhớt.</td></tr>`}</tbody>
      </table></div>
      ${panelPagination("oilAlerts", paged)}
    </div>`;
}

function ticketNotificationPanel(db = getDb(), assetType = "Xe máy") {
  const allRows = db.tickets
    .filter((ticket) => ticket.assetType === assetType && !["Hoàn thành", "Đã hủy"].includes(ticket.status))
    .sort((a, b) => new Date(b.createdAt || b.foundDate || todayISO()) - new Date(a.createdAt || a.foundDate || todayISO()));
  const pageKey = assetType === "Xe máy" ? "bikeTickets" : "equipmentTickets";
  const paged = paginatePanel(allRows, pageKey, 5);
  const title = assetType === "Xe máy" ? "Thông báo phiếu sửa xe mới" : "Thông báo phiếu sửa thiết bị mới";
  return `<div class="card oil-alert-card ticket-notice-card">
    <div class="panel-title">
      <div><h3>${title}</h3><span class="hint">Hiển thị tất cả phiếu mới/chưa hoàn thành, có giờ và ngày tạo để quản trị theo dõi nhanh.</span></div>
      <span class="pill warning">${allRows.length} phiếu</span>
    </div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Mã phiếu</th><th>Tài sản</th><th>Lỗi</th><th>Ưu tiên</th><th>Giờ tạo</th><th>Ngày tạo</th><th>Hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>${paged.rows.map((ticket) => `<tr>
        <td><strong>${ticket.code}</strong></td>
        <td>${ticketAssetLabel(db, ticket)}</td>
        <td><strong>${ticket.issue || "-"}</strong></td>
        <td>${pill(ticket.priority)}</td>
        <td><strong>${formatTime(ticket.createdAt || ticket.foundDate)}</strong></td>
        <td>${formatDate(ticket.createdAt || ticket.foundDate)}</td>
        <td>${formatDate(ticket.dueDate)}</td>
        <td>${pill(ticket.status)}</td>
        <td>${ticketEditButton(ticket)}</td>
      </tr>`).join("") || `<tr><td colspan="9" class="empty">Chưa có phiếu sửa mới.</td></tr>`}</tbody>
    </table></div>
    ${panelPagination(pageKey, paged)}
  </div>`;
}

function ticketHistoryPanel(db = getDb(), assetType = "Xe máy") {
  const allRows = db.tickets
    .filter((ticket) => ticket.assetType === assetType)
    .sort((a, b) => new Date(b.createdAt || b.foundDate || todayISO()) - new Date(a.createdAt || a.foundDate || todayISO()));
  const pageKey = assetType === "Xe máy" ? "bikeTicketHistory" : "equipmentTicketHistory";
  const paged = paginatePanel(allRows, pageKey, 5);
  const title = assetType === "Xe máy" ? "Lịch sử tạo phiếu sửa xe" : "Lịch sử tạo phiếu sửa thiết bị";
  return `<div class="card oil-alert-card ticket-history-card">
    <div class="panel-title">
      <div><h3>${title}</h3><span class="hint">Theo dõi toàn bộ phiếu đã tạo, gồm giờ tạo, ngày tạo, trạng thái và chi phí.</span></div>
      <span class="pill">${allRows.length} phiếu</span>
    </div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Mã phiếu</th><th>Tài sản</th><th>Lỗi</th><th>Giờ tạo</th><th>Ngày tạo</th><th>Chi phí</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>${paged.rows.map((ticket) => `<tr>
        <td><strong>${ticket.code}</strong><br><span class="hint">${ticket.priority || "-"}</span>${ticketEditButton(ticket, "mini")}</td>
        <td>${ticketAssetLabel(db, ticket)}</td>
        <td><strong>${ticket.issue || "-"}</strong></td>
        <td><strong>${formatTime(ticket.createdAt || ticket.foundDate)}</strong></td>
        <td>${formatDate(ticket.createdAt || ticket.foundDate)}</td>
        <td>${can("costs") ? money(ticketCost(ticket)) : "<span class='hint'>Ẩn theo quyền</span>"}</td>
        <td>${pill(ticket.status)}</td>
        <td>${ticketEditButton(ticket)}</td>
      </tr>`).join("") || `<tr><td colspan="8" class="empty">Chưa có lịch sử tạo phiếu.</td></tr>`}</tbody>
    </table></div>
    ${panelPagination(pageKey, paged)}
  </div>`;
}

function ticketEditButton(ticket, variant = "") {
  if (!canAny(["manage", "maintenance"])) return `<span class="hint">Chỉ xem</span>`;
  const className = variant === "mini" ? "ticket-edit-mini" : "secondary";
  return `<button class="${className}" type="button" data-modal="ticketEdit:${ticket.id}">Sửa phiếu</button>`;
}

function bookingHistoryPanel(data = bookingSeedData()) {
  const allRows = [...(data.bookings || [])]
    .sort((a, b) => new Date(b.createdAt || b.start || todayISO()) - new Date(a.createdAt || a.start || todayISO()));
  const paged = paginatePanel(allRows, "bookingHistory", 6);
  return `<div class="card oil-alert-card booking-history-card">
    <div class="panel-title">
      <div><h3>Lịch sử đặt phòng</h3><span class="hint">Danh sách phiếu đặt phòng đã tạo, có thời gian tạo, phòng, khách và tình trạng thanh toán.</span></div>
      <span class="pill">${allRows.length} phiếu</span>
    </div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Mã</th><th>Nhóm/khách</th><th>Khách sạn / phòng</th><th>Giờ tạo</th><th>Ngày tạo</th><th>Thời gian ở</th><th>Thanh toán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>${paged.rows.map((booking) => `<tr>
        <td><strong>${booking.id}</strong></td>
        <td><strong>${booking.group}</strong><br><span class="hint">${booking.customer || "-"} · ${booking.phone || "-"}</span></td>
        <td><strong>${booking.hotelName || "-"}</strong><br><span class="hint">Phòng ${booking.room}</span></td>
        <td><strong>${formatTime(booking.createdAt || booking.start)}</strong></td>
        <td>${formatDate(booking.createdAt || booking.start)}</td>
        <td>${formatDate(booking.start)} → ${formatDate(booking.end)}<br><span class="hint">${booking.guests || 0} khách</span></td>
        <td><strong>${money(booking.total || 0)}</strong><br><span class="hint">Đã thu ${money(booking.paid || 0)}</span></td>
        <td>${pill(booking.status)}</td>
        <td>${can("booking_edit") ? `<button class="secondary" data-modal="booking:${booking.id}">Chi tiết</button>` : "<span class='hint'>Chỉ xem</span>"}</td>
      </tr>`).join("") || `<tr><td colspan="9" class="empty">Chưa có lịch sử đặt phòng.</td></tr>`}</tbody>
    </table></div>
    ${panelPagination("bookingHistory", paged)}
  </div>`;
}

function paginatePanel(rows = [], key, perPage = 5) {
  state.panelPages = state.panelPages || {};
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const current = Math.min(Math.max(1, Number(state.panelPages[key] || 1)), totalPages);
  state.panelPages[key] = current;
  const start = (current - 1) * perPage;
  return {
    rows: rows.slice(start, start + perPage),
    page: current,
    totalPages,
    total: rows.length,
    start: rows.length ? start + 1 : 0,
    end: Math.min(rows.length, start + perPage)
  };
}

function panelPagination(key, pageInfo) {
  if (!pageInfo || pageInfo.totalPages <= 1) {
    return pageInfo?.total ? `<div class="panel-pager"><span>Hiển thị ${pageInfo.start} - ${pageInfo.end} trong ${pageInfo.total}</span></div>` : "";
  }
  const pages = Array.from({ length: pageInfo.totalPages }, (_, index) => index + 1);
  return `<div class="panel-pager">
    <span>Hiển thị ${pageInfo.start} - ${pageInfo.end} trong ${pageInfo.total}</span>
    <div>
      <button class="ghost" ${pageInfo.page <= 1 ? "disabled" : ""} data-action="panel-page:${key}:${pageInfo.page - 1}">‹</button>
      ${pages.map((page) => `<button class="ghost ${page === pageInfo.page ? "active" : ""}" data-action="panel-page:${key}:${page}">${page}</button>`).join("")}
      <button class="ghost" ${pageInfo.page >= pageInfo.totalPages ? "disabled" : ""} data-action="panel-page:${key}:${pageInfo.page + 1}">›</button>
    </div>
  </div>`;
}

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Ho_Chi_Minh" });
}

function ticketAssetLabel(db, ticket) {
  const asset = ticket.assetType === "Xe máy"
    ? db.motorbikes.find((bike) => bike.id === ticket.assetId)
    : db.equipment.find((item) => item.id === ticket.assetId);
  if (!asset) return "-";
  return `<strong>${asset.code || "-"}</strong><br><span class="hint">${asset.name || ""}${asset.plate ? ` · ${asset.plate}` : ""}${asset.room ? ` · Phòng ${asset.room}` : ""}</span>`;
}

function equipmentMaintenanceOverview(db = getDb()) {
  const rows = db.equipment.map((item) => {
    const tickets = db.tickets.filter((ticket) => ticket.assetType === "Thiết bị" && ticket.assetId === item.id);
    const completedTickets = tickets.filter((ticket) => ticket.status === "Hoàn thành");
    const repairCost = tickets.reduce((sum, ticket) => sum + Number(ticket.actualCost || ticket.estimatedCost || 0), 0);
    const daysLeft = daysUntil(item.nextMaintenance);
    const alert = isEquipmentMaintenanceAlert(item);
    return { item, tickets, completedTickets, repairCost, daysLeft, alert };
  });
  const alertCount = rows.filter((row) => row.alert).length;
  const acAlertCount = rows.filter((row) => row.alert && row.item.type === "Máy lạnh").length;
  const otherAlertCount = rows.filter((row) => row.alert && row.item.type !== "Máy lạnh").length;
  const repairTotal = rows.reduce((sum, row) => sum + row.tickets.length, 0);
  return `
    <div class="grid cols-4">
      ${metric("Cảnh báo 30 ngày", alertCount)}
      ${metric("Máy lạnh đến hạn", acAlertCount)}
      ${metric("Thiết bị khác đến hạn", otherAlertCount)}
      ${metric("Lần sửa thiết bị", repairTotal)}
    </div>
    ${equipmentAlertTable(rows)}
    <div class="maintenance-history-grid">
      ${ticketNotificationPanel(db, "Thiết bị")}
      ${ticketHistoryPanel(db, "Thiết bị")}
    </div>
    ${equipmentRepairHistoryTable(rows)}
  `;
}

function daysUntil(dateValue) {
  return Math.ceil((new Date(dateValue) - new Date(todayISO())) / 86400000);
}

function isEquipmentMaintenanceAlert(item) {
  return Boolean(item.maintenanceAlertEnabled !== false && !item.maintenanceAlertHandled && daysUntil(item.nextMaintenance) <= 30);
}

function equipmentAlertTable(rows) {
  const alertRows = rows
    .filter((row) => row.alert || row.item.maintenanceAlertEnabled !== false)
    .sort((a, b) => a.daysLeft - b.daysLeft);
  return `<div class="card oil-alert-card">
    <div class="panel-title">
      <div><h3>Thông báo cảnh báo bảo trì thiết bị trong 30 ngày</h3><span class="hint">Theo dõi máy lạnh và các thiết bị khác sắp đến hạn bảo trì/vệ sinh.</span></div>
      <span class="pill warning">${alertRows.filter((row) => row.alert).length} cảnh báo</span>
    </div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Thiết bị</th><th>Loại</th><th>Vị trí</th><th>Ngày bảo trì</th><th>Còn lại</th><th>Cảnh báo</th><th>Xử lý</th><th>Thao tác</th></tr></thead>
      <tbody>${alertRows.map(({ item, daysLeft, alert }) => `<tr class="${alert ? "alert-row" : ""}">
        <td><strong>${item.code}  · ${item.name}</strong><br><span class="hint">${item.brand || ""} ${item.model || ""}</span></td>
        <td>${item.type}</td>
        <td>${item.room || item.area || "-"}<br><span class="hint">${item.floor || ""}</span></td>
        <td>${formatDate(item.nextMaintenance)}</td>
        <td><strong>${daysLeft < 0 ? `Quá ${Math.abs(daysLeft)} ngày` : `${daysLeft} ngày`}</strong><br><span class="hint">NgNgưỡng cảnh báo: 30 ngày</span></td>
        <td>${item.maintenanceAlertEnabled === false ? pill("Tắt") : pill(alert ? "Sắp đến hạn" : "Đang bật")}</td>
        <td>${item.maintenanceAlertHandled ? pill("Đã xử lý") : pill(alert ? "Cần bảo trì" : "Đang theo dõi")}</td>
        <td><div class="actions">
          <button class="ghost" data-action="toggle-equipment-alert:${item.id}">${item.maintenanceAlertEnabled === false ? "Bật cảnh báo" : "Tắt cảnh báo"}</button>
          <button class="secondary" data-action="mark-equipment-maintained:${item.id}">Đã bảo trì</button>
          <button class="ghost" data-modal="equipment:${item.id}">Cập nhật</button>
          <button class="ghost" data-modal="ticket:Thiết bị:${item.id}">Tạo phiếu</button>
        </div></td>
      </tr>`).join("") || `<tr><td colspan="8" class="empty">Chưa có thiết bị cần cảnh báo trong 30 ngày.</td></tr>`}</tbody>
    </table></div>
  </div>`;
}

function equipmentRepairHistoryTable(rows) {
  return `<div class="card">
    <div class="panel-title"><h3>Lịch sử sửa chữa thiết bị</h3><span class="pill">${rows.length} thiết bị</span></div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Thiết bị</th><th>Lần sửa</th><th>Hoàn thành</th><th>Chi phí</th><th>Lần gần nhất</th><th>Vấn đề gần nhất</th><th>Thao tác</th></tr></thead>
      <tbody>${rows.map(({ item, tickets, completedTickets, repairCost }) => {
        const latest = [...tickets].sort((a, b) => new Date(b.foundDate || b.dueDate) - new Date(a.foundDate || a.dueDate))[0];
        return `<tr>
          <td><strong>${item.code}  · ${item.name}</strong><br><span class="hint">${item.type}  · ${item.room || item.area || "-"}</span></td>
          <td>${tickets.length} phi phiếu</td>
          <td>${completedTickets.length} l lần</td>
          <td>${can("costs") ? money(repairCost) : "<span class='hint'>Ẩn theo quyền</span>"}</td>
          <td>${latest ? formatDate(latest.foundDate || latest.dueDate) : "-"}</td>
          <td>${latest ? `${latest.issue}<br><span class="hint">${latest.status}</span>` : "<span class='hint'>Chưa có lịch sử sửa chữa.</span>"}</td>
          <td><div class="actions"><button class="secondary" data-modal="ticket:Thiết bị:${item.id}">Tạo phiếu</button><button class="ghost" data-modal="equipment:${item.id}">Cập nhật thiết bị</button></div></td>
        </tr>`;
      }).join("")}</tbody>
    </table></div>
  </div>`;
}

function ticketRow(t) {
  const asset = assetName(t);
  return `<tr>
    <td><strong>${t.code}</strong></td><td>${asset}</td><td>${t.issue}</td><td>${pill(t.priority)}</td>
    <td>${can("costs") ? money(Number(t.actualCost || t.estimatedCost || 0)) : "<span class='hint'>Ẩn theo quyền</span>"}</td>
    <td>${formatDate(t.dueDate)}</td><td>${pill(t.status)}</td>
    <td><div class="actions"><button class="secondary" data-modal="ticketEdit:${t.id}">Cập nhật</button>${t.status === "Chờ nghiệm thu" && canAny(["manage"]) ? `<button class="ghost" data-action="approve:${t.id}">Nghi\u1ec7m thu</button>` : ""}</div></td>
  </tr>`;
}

function equipmentView() {
  const rows = filterRows(getDb().equipment, ["code", "name", "type", "room", "condition"]);
  const types = ["Máy lạnh", "Máy giặt", "Tivi", "Tủ lạnh", "Máy nước nóng", "Máy bơm", "Tủ đông", "Thiết bị cafe", "Thiết bị khác"];
  return `
    ${pageHeader("Thiết bị khách sạn", "Quản lý máy lạnh, máy giặt và thiết bị theo phòng, bảo hành, bảo trì, chi phí.", canAny(["manage"]) ? `<button class="primary" data-modal="equipment">Th\u00eam thi\u1ebft b\u1ecb</button>` : "")}
    ${filters(types)}
    <div class="table-wrap">
      <table>
        <thead><tr><th>Mã</th><th>Thiết bị</th><th>Vị trí</th><th>Bảo hành</th><th>Bảo trì</th><th>Checklist</th><th>Tình trạng</th><th>Chi phí sửa</th><th>Thao tác</th></tr></thead>
        <tbody>${rows.map((e) => `<tr>
          <td><strong>${e.code}</strong></td><td>${e.name}<br><span class="hint">${e.brand} ${e.model}  · ${e.extra || ""}</span></td>
          <td>${e.room}<br><span class="hint">${e.floor}  · ${e.area}</span></td><td>${formatDate(e.warrantyEnd)}</td><td>${formatDate(e.nextMaintenance)}</td>
          <td><span class="hint">${e.maintenanceChecklist || getDb().equipmentTypes.find((type) => type.name === e.type)?.checklist || ""}</span></td>
          <td>${pill(e.condition)}</td><td>${can("costs") ? money(e.repairCost) : "<span class='hint'>Ẩn theo quyền</span>"}</td>
          <td><div class="actions">${can("manage") ? `<button class="ghost" data-modal="equipment:${e.id}">Sửa</button>` : ""}<button class="secondary" data-modal="ticket:Thiết bị:${e.id}">Báo hư</button></div></td>
        </tr>`).join("") || `<tr><td colspan="9" class="empty">Không có thiết bị phù hợp.</td></tr>`}</tbody>
      </table>
    </div>
  `;
}

function equipmentTypesView() {
  const rows = filterRows(getDb().equipmentTypes || [], ["name", "checklist", "requiredFields", "note"]);
  return `
    ${pageHeader("Loại thiết bị", "Cấu hình loại thiết bị, chu kỳ bảo trì, hạn cảnh báo bảo hành và checklist kiểm tra.", can("manage") ? `<button class="primary" data-modal="equipmentType">Thêm loại thiết bị</button>` : "")}
    ${filters([])}
    <div class="table-wrap"><table>
      <thead><tr><th>Loại thiết bị</th><th>Chu kỳ bảo trì</th><th>Cảnh báo bảo hành</th><th>Thông tin cần nhập</th><th>Checklist bảo trì</th><th>Thao tác</th></tr></thead>
      <tbody>${rows.map((type) => `<tr>
        <td><strong>${type.name}</strong><br><span class="hint">${type.note || ""}</span></td>
        <td>${Number(type.maintenanceIntervalDays || 0).toLocaleString("vi-VN")} ng ngày</td>
        <td>Trước ${Number(type.warrantyAlertDays || 0).toLocaleString("vi-VN")} ngày</td>
        <td>${type.requiredFields || ""}</td>
        <td>${type.checklist || ""}</td>
        <td><div class="actions"><button class="ghost" data-modal="equipmentType:${type.id}">Sửa</button></div></td>
      </tr>`).join("") || `<tr><td colspan="6" class="empty">Chưa có loại thiết bị.</td></tr>`}</tbody>
    </table></div>
  `;
}

function maintenanceCalendarView() {
  const db = getDb();
  const items = [
    ...db.motorbikes.map((b) => ({ type: "Xe", code: b.code, name: b.name, date: b.nextMaintenance, status: b.status })),
    ...db.equipment.map((e) => ({ type: "Thiết bị", code: e.code, name: e.name, date: e.nextMaintenance, status: e.condition }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  return `
    ${pageHeader("Lịch bảo trì", "Lịch bảo trì chung cho xe và thiết bị: hôm nay, 7 ngày, 30 ngày, quá hạn.", "")}
    <div class="grid cols-4">
      ${maintenanceBucket("Quá hạn", items.filter((i) => new Date(i.date) < new Date(todayISO())))}
      ${maintenanceBucket("Hôm nay", items.filter((i) => i.date === todayISO()))}
      ${maintenanceBucket("Trong 7 ngày", items.filter((i) => new Date(i.date) >= new Date(todayISO()) && new Date(i.date) <= new Date(todayISO(7))))}
      ${maintenanceBucket("Trong 30 ngày", items.filter((i) => new Date(i.date) > new Date(todayISO(7)) && new Date(i.date) <= new Date(todayISO(30))))}
    </div>
  `;
}

function maintenanceBucket(title, items) {
  return `<div class="card"><div class="panel-title"><h3>${title}</h3><span class="badge">${items.length}</span></div><div class="timeline">${items.map((i) => `<div class="timeline-item"><strong>${i.code}  · ${i.name}</strong><span class="hint">${i.type}  · ${formatDate(i.date)}  · ${i.status}</span></div>`).join("") || `<div class="empty">KhKhông có.</div>`}</div></div>`;
}

function ownersView() {
  const db = getDb();
  const rows = filterRows(db.owners, ["name", "phone", "type", "note"]);
  const financialRows = ownerRevenueRows(db);
  return `
    ${pageHeader("Chủ sở hữu xe", "Quản lý xe thuộc khách sạn hoặc xe ký gửi. Có thể sửa, ẩn/hiện hoặc xóa chủ xe khi không còn xe liên kết.", can("manage") ? `<button class="primary" data-modal="owner">Th\u00eam ch\u1ee7 xe</button>` : "")}
    ${filters([])}
    <div class="table-wrap"><table><thead><tr><th>Tên</th><th>Điện thoại</th><th>Hình thức</th><th>Số xe</th><th>Doanh thu</th><th>Lợi nhuận</th><th>Trạng thái</th><th>Ghi chú</th><th>Thao tác</th></tr></thead><tbody>
    ${rows.map((o) => {
      const summary = financialRows.find((row) => row.owner.id === o.id);
      const actions = can("manage") ? `<div class="actions"><button class="ghost" data-modal="owner:${o.id}">Sửa</button><button class="secondary" type="button" data-action="toggle-owner:${o.id}">${o.hidden ? "Hiện" : "Ẩn"}</button><button class="danger" type="button" data-action="delete-owner:${o.id}">Xóa</button></div>` : "";
      return `<tr class="${o.hidden ? "muted-row" : ""}"><td><strong>${o.name}</strong></td><td>${o.phone}</td><td>${o.type}</td><td>${summary?.bikeCount || 0}</td><td>${can("finance") ? money(summary?.revenue || 0) : "<span class='hint'>Ẩn theo quyền</span>"}</td><td>${can("finance") ? money(summary?.profit || 0) : "<span class='hint'>Ẩn theo quyền</span>"}</td><td>${pill(o.hidden ? "Đang ẩn" : "Đang hiển thị")}</td><td>${o.note || ""}</td><td>${actions}</td></tr>`;
    }).join("")}
    </tbody></table></div>
    <p class="hint">Chủ xe đã ẩn sẽ không hiện trong danh sách chọn nhanh khi thêm xe mới, nhưng dữ liệu xe và báo cáo cũ vẫn được giữ.</p>
  `;
}

function upsertOwner(db, data, id) {
  if (!Array.isArray(db.owners)) db.owners = [];
  const name = String(data.name || "").trim();
  if (!name) {
    showToast("Hãy nhập tên chủ xe.");
    throw new Error("Missing owner name");
  }
  if (db.owners.some((owner) => owner.id !== id && String(owner.name || "").trim().toLowerCase() === name.toLowerCase())) {
    showToast("Tên chủ xe đã tồn tại.");
    throw new Error("Duplicate owner");
  }
  const payload = {
    name,
    phone: String(data.phone || "").trim(),
    type: data.type || "Ký gửi",
    hidden: data.hidden === "true",
    note: data.note || ""
  };
  if (id) Object.assign(db.owners.find((owner) => owner.id === id), payload);
  else db.owners.push({ id: uid("O"), ...payload });
}

function toggleOwnerVisibility(id) {
  mutateDb((db) => {
    const owner = db.owners.find((item) => item.id === id);
    if (!owner) return { record: id };
    owner.hidden = !owner.hidden;
    return { record: owner.name, after: owner.hidden ? "Đang ẩn" : "Đang hiển thị" };
  }, "Cập nhật hiển thị chủ xe");
  showToast("Đã cập nhật trạng thái chủ xe.");
}

function deleteOwner(id) {
  const db = getDb();
  const owner = db.owners.find((item) => item.id === id);
  if (!owner) {
    showToast("Không tìm thấy chủ xe cần xóa.");
    return;
  }
  const linkedBikes = db.motorbikes.filter((bike) => bike.ownerId === id);
  if (linkedBikes.length) {
    showToast(`Chủ xe này đang có ${linkedBikes.length} xe. Hãy ẩn hoặc chuyển xe sang chủ khác trước khi xóa.`);
    return;
  }
  if (!confirm(`Xóa chủ xe ${owner.name}?`)) return;
  mutateDb((draft) => {
    draft.owners = draft.owners.filter((item) => item.id !== id);
    state.modal = null;
    return { record: owner.name, before: "Đã tồn tại", after: "Đã xóa" };
  }, "Xóa chủ xe");
  showToast("Đã xóa chủ xe.");
}

function financeView() {
  const db = getDb();
  const month = state.reportMonth || todayISO().slice(0, 7);
  const s = financeMonthStats(db, month);
  const rentals = s.rentals;
  const ownerRows = ownerRevenueRows(db, month);
  return `
    ${pageHeader("Doanh thu và chi phí", "Chỉ Admin và Manager được xem số liệu tài chính.", `<button class="secondary" data-action="export-report">Xuất Excel</button>`)}
    <div class="card toolbar-card">
      <div class="panel-title">
        <div>
          <h3>Lọc doanh thu và chi phí</h3>
          <span class="hint">Chọn tháng để xem doanh thu, công nợ, chi phí sửa xe và lợi nhuận từng chủ xe.</span>
        </div>
        <label class="month-filter">Tháng <input type="month" value="${month}" data-report-month></label>
      </div>
    </div>
    <div class="grid cols-3">
      ${metric("Doanh thu trong tháng", money(s.monthRevenue))}
      ${metric("Tiền chưa thanh toán", money(s.unpaid))}
      ${metric("Chi phí sửa xe", money(s.bikeRepair))}
      ${metric("Chi phí sửa thiết bị", money(s.equipmentRepair))}
      ${metric("Lợi nhuận ước tính", money(s.profit))}
      ${metric("Số phiếu thuê", s.rentalCount)}
    </div>
    <div class="card">
      <div class="panel-title"><h3>Tỷ lệ thanh toán trong tháng ${month}</h3><span class="pill">${rentals.length} phiếu</span></div>
      ${rentals.map((r) => `<div style="margin:12px 0"><strong>${r.code}  · ${r.customer}</strong><div class="progress"><span style="width:${Math.min(100, (Number(r.paid) / Number(r.total || 1)) * 100)}%"></span></div><span class="hint">${money(r.paid)} / ${money(r.total)} · ${formatDate(r.start)}</span></div>`).join("") || `<div class="empty">Tháng này chưa có phiếu thuê.</div>`}
    </div>
    <div class="card">
      <div class="panel-title"><h3>Doanh thu và lợi nhuận theo chủ xe trong tháng</h3><button class="secondary" data-view="reports">Xem báo cáo</button></div>
      ${ownerFinanceTable(ownerRows)}
    </div>
  `;
}

function financeMonthStats(db, month) {
  const rentals = db.rentals.filter((rental) => rental.status !== "Đã hủy" && rentalDayKeysInMonth(rental, month).length > 0);
  const bikeTickets = db.tickets.filter((ticket) => ticket.assetType === "Xe máy" && dateInMonth(ticket.foundDate || ticket.createdAt || ticket.dueDate, month));
  const equipmentTickets = db.tickets.filter((ticket) => ticket.assetType === "Thiết bị" && dateInMonth(ticket.foundDate || ticket.createdAt || ticket.dueDate, month));
  const bikeRepair = bikeTickets.reduce((sum, ticket) => sum + Number(ticket.actualCost || ticket.estimatedCost || 0), 0);
  const equipmentRepair = equipmentTickets.reduce((sum, ticket) => sum + Number(ticket.actualCost || ticket.estimatedCost || 0), 0);
  const monthRevenue = rentals.reduce((sum, rental) => sum + Number(rental.paid || 0), 0);
  return {
    rentals,
    rentalCount: rentals.length,
    monthRevenue,
    unpaid: rentals.reduce((sum, rental) => sum + Math.max(0, Number(rental.total || 0) - Number(rental.paid || 0)), 0),
    bikeRepair,
    equipmentRepair,
    profit: monthRevenue - bikeRepair - equipmentRepair
  };
}

function reportsView() {
  const db = getDb();
  const damaged = db.motorbikes.map((b) => ({ b, count: db.tickets.filter((t) => t.assetId === b.id).length })).sort((a, b) => b.count - a.count);
  const ownerRows = ownerRevenueRows(db);
  const monthlyOwnerRows = ownerRevenueRows(db, state.reportMonth);
  const bikeRevenueRows = bikeRevenueReportRows(db);
  const monthlyRental = monthlyBikeRentalReport(db, state.reportMonth);
  const totals = reportTotals(db, ownerRows);
  return `
    ${pageHeader("Báo cáo", "Dashboard tổng hợp doanh thu, lợi nhuận, tình trạng xe và thiết bị.", `<button class="secondary" data-action="print-report">In / Lưu PDF</button><button class="primary" data-action="export-report">Xuất Excel</button>`)}
    <div id="report-print-area" class="report-dashboard">
      <div class="report-hero">
        <div>
          <span class="hint">COCO BAY INTERNAL MANAGEMENT</span>
          <h2>Báo cáo tổng hợp vận hành</h2>
          <p>Ngày xuất: ${formatDateTime(new Date())}</p>
        </div>
        <div class="report-score">
          <span>Lợi nhuận ước tính</span>
          <strong>${money(totals.profit)}</strong>
        </div>
      </div>

      <div class="grid cols-4">
        ${reportKpi("Tổng doanh thu", money(totals.revenue), "Đã thu từ phiếu thuê xe")}
        ${reportKpi("Còn phải thu", money(totals.receivable), "Các phiếu chưa thanh toán đủ")}
        ${reportKpi("Chi phí sửa xe", money(totals.repairCost), "Theo phiếu bảo trì xe")}
        ${reportKpi("Số xe đang quản lý", totals.bikeCount, `Thuộc ${ownerRows.length} chủ xe`)}
      </div>

      ${monthlyBikeRentalSection(monthlyRental)}
      ${monthlyOwnerFinanceSection(monthlyOwnerRows, state.reportMonth)}

      <div class="grid cols-2">
        ${ownerRevenueChart(ownerRows)}
        ${bikeRevenueChart(bikeRevenueRows)}
      </div>

      <div class="grid cols-2">
        <div class="card"><div class="panel-title"><h3>Báo cáo doanh thu từng chủ xe</h3></div>${ownerFinanceTable(ownerRows)}</div>
        <div class="card"><div class="panel-title"><h3>Top xe cần chú ý</h3></div>
          <div class="ranking-list">
            ${damaged.map((x, index) => `<div class="ranking-item"><b>${index + 1}</b><span><strong>${x.b.code} · ${x.b.name}</strong><small>${x.count} phiếu sửa chữa</small></span></div>`).join("") || `<div class="empty">Chưa có dữ liệu hư hỏng.</div>`}
          </div>
        </div>
      </div>

      <div class="grid cols-2">
        <div class="card"><div class="panel-title"><h3>Máy lạnh đến hạn vệ sinh</h3></div>${db.equipment.filter((e) => e.type === "Máy lạnh").map((e) => `<div class="timeline-item"><strong>${e.code}  · Phòng ${e.room}</strong><span>${formatDate(e.nextMaintenance)}  · ${e.condition}</span></div>`).join("")}</div>
        <div class="card"><div class="panel-title"><h3>Chi phí theo phòng</h3></div>${db.equipment.map((e) => `<div class="timeline-item"><strong>${e.room}</strong><span>${e.name}: ${money(e.repairCost)}</span></div>`).join("")}</div>
      </div>
    </div>
  `;
}

function reportTotals(db, ownerRows) {
  return {
    revenue: ownerRows.reduce((sum, row) => sum + row.revenue, 0),
    receivable: ownerRows.reduce((sum, row) => sum + row.receivable, 0),
    repairCost: ownerRows.reduce((sum, row) => sum + row.repairCost, 0),
    profit: ownerRows.reduce((sum, row) => sum + row.profit, 0),
    bikeCount: db.motorbikes.length
  };
}

function reportKpi(label, value, caption) {
  return `<div class="card report-kpi"><span>${label}</span><strong>${value}</strong><small>${caption}</small></div>`;
}

function monthlyBikeRentalReport(db, month = todayISO().slice(0, 7)) {
  const rowMap = new Map(db.motorbikes.map((bike) => [bike.id, {
    bike,
    owner: db.owners.find((owner) => owner.id === bike.ownerId),
    dateSet: new Set(),
    rentalCount: 0,
    revenue: 0
  }]));
  db.rentals
    .filter((rental) => rental.status !== "Đã hủy")
    .forEach((rental) => {
      const bikeIds = rentalBikeIds(rental);
      const revenueShare = bikeIds.length ? Number(rental.paid || 0) / bikeIds.length : 0;
      const days = rentalDayKeysInMonth(rental, month);
      if (!days.length) return;
      bikeIds.forEach((bikeId) => {
        const row = rowMap.get(bikeId);
        if (!row) return;
        days.forEach((day) => row.dateSet.add(day));
        row.rentalCount += 1;
        row.revenue += revenueShare;
      });
    });
  const rows = [...rowMap.values()]
    .map((row) => ({ ...row, bikeDays: row.dateSet.size, days: [...row.dateSet].sort() }))
    .filter((row) => row.bikeDays > 0)
    .sort((a, b) => b.bikeDays - a.bikeDays || b.revenue - a.revenue);
  const daysInMonth = new Date(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 0).getDate();
  return {
    month,
    rows,
    daysInMonth,
    totalBikeDays: rows.reduce((sum, row) => sum + row.bikeDays, 0),
    rentedBikeCount: rows.length,
    rentalCount: rows.reduce((sum, row) => sum + row.rentalCount, 0),
    revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
    totalBikes: db.motorbikes.length
  };
}

function rentalDayKeysInMonth(rental, month) {
  const start = new Date(rental.start);
  const end = new Date(rental.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return [];
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const monthStart = new Date(year, monthIndex, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  const rangeStart = start > monthStart ? start : monthStart;
  const rangeEnd = end < monthEnd ? end : monthEnd;
  if (rangeEnd < rangeStart) return [];
  const days = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
  const last = new Date(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
  while (cursor <= last) {
    days.push(localDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function localDateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function monthlyBikeRentalSection(report) {
  const average = report.daysInMonth ? (report.totalBikeDays / report.daysInMonth).toFixed(1) : "0.0";
  return `<div class="card monthly-rental-card">
    <div class="panel-title">
      <div>
        <h3>Tổng hợp số lượng xe cho thuê trong tháng</h3>
        <span class="hint">Cách tính: 1 xe thuê trong 1 ngày = 1 xe-ngày. Xe thuê nhiều ngày sẽ cộng theo từng ngày.</span>
      </div>
      <label class="month-filter">Tháng <input type="month" value="${report.month}" data-report-month></label>
    </div>
    <div class="grid cols-4">
      ${reportKpi("Tổng xe-ngày", report.totalBikeDays, `TTổng số ngày có xe được thuê trong tháng ${report.month}`)}
      ${reportKpi("Số xe có phát sinh thuê", report.rentedBikeCount, `Trong tTrong tổng ${report.totalBikes} xe`)}
      ${reportKpi("Số phiếu thuê", report.rentalCount, "Không tính phiếu đã hủy")}
      ${reportKpi("Bình quân/ngày", average, "Xe được thuê trung bình mỗi ngày")}
    </div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Xe</th><th>Chủ xe</th><th>Số xe-ngày</th><th>Số phiếu thuê</th><th>Doanh thu đã thu</th><th>Ngày phát sinh</th></tr></thead>
      <tbody>${report.rows.map((row) => `<tr>
        <td><strong>${row.bike.code}  · ${row.bike.name}</strong><br><span class="hint">${row.bike.plate}</span></td>
        <td>${row.owner?.name || "-"}</td>
        <td><strong>${row.bikeDays}</strong></td>
        <td>${row.rentalCount}</td>
        <td>${money(row.revenue)}</td>
        <td><span class="hint">${row.days.map(formatDate).join(", ")}</span></td>
      </tr>`).join("") || `<tr><td colspan="6" class="empty">Tháng này chưa có xe được thuê.</td></tr>`}</tbody>
    </table></div>
  </div>`;
}

function monthlyOwnerFinanceSection(rows, month) {
  const totals = {
    revenue: rows.reduce((sum, row) => sum + row.revenue, 0),
    receivable: rows.reduce((sum, row) => sum + row.receivable, 0),
    repairCost: rows.reduce((sum, row) => sum + row.repairCost, 0),
    profit: rows.reduce((sum, row) => sum + row.profit, 0)
  };
  return `<div class="card monthly-owner-card">
    <div class="panel-title">
      <div>
        <h3>Doanh thu và chi phí sửa xe theo chủ xe trong tháng</h3>
        <span class="hint">Tháng ${month}: tổng hợp tiền thuê xe đã thu, tiền còn phải thu, chi phí sửa/bảo trì xe và lợi nhuận từng chủ xe.</span>
      </div>
      <span class="pill">${rows.length} chủ xe</span>
    </div>
    <div class="grid cols-4">
      ${reportKpi("Doanh thu đã thu", money(totals.revenue), "Theo phiếu thuê trong tháng")}
      ${reportKpi("Còn phải thu", money(totals.receivable), "Tiền thuê chưa thanh toán đủ")}
      ${reportKpi("Chi phí sửa xe", money(totals.repairCost), "Theo phiếu sửa xe trong tháng")}
      ${reportKpi("Lợi nhuận tạm tính", money(totals.profit), "Doanh thu trừ chi phí sửa xe")}
    </div>
    ${ownerFinanceTable(rows)}
  </div>`;
}

function bikeRevenueReportRows(db) {
  return db.motorbikes.map((bike) => {
    const owner = db.owners.find((o) => o.id === bike.ownerId);
    const revenue = db.rentals.filter((r) => r.bikeId === bike.id).reduce((sum, r) => sum + Number(r.paid || 0), 0);
    return { bike, owner, revenue };
  }).sort((a, b) => b.revenue - a.revenue);
}

function ownerRevenueChart(rows) {
  const max = Math.max(1, ...rows.map((row) => row.revenue));
  return `<div class="card chart-card report-chart">
    <div class="panel-title"><h3>Doanh thu theo chủ xe</h3><span class="pill">${rows.length} chủ xe</span></div>
    <div class="bar-list">${rows.map((row) => `<div class="bar-row">
      <div class="bar-label"><span>${row.owner.name}</span><strong>${money(row.revenue)}</strong></div>
      <div class="bar-track"><span class="success" style="width:${Math.max(4, Math.round((row.revenue / max) * 100))}%"></span></div>
      <div class="hint">Lợi nhuận ${money(row.profit)} · ${row.bikeCount} xe</div>
    </div>`).join("") || `<div class="empty">Chưa có dữ liệu.</div>`}</div>
  </div>`;
}

function bikeRevenueChart(rows) {
  const max = Math.max(1, ...rows.map((row) => row.revenue));
  return `<div class="card chart-card report-chart">
    <div class="panel-title"><h3>Doanh thu theo xe</h3><span class="pill">${rows.length} xe</span></div>
    <div class="bar-list">${rows.map((row) => `<div class="bar-row">
      <div class="bar-label"><span>${row.bike.code} · ${row.bike.name}</span><strong>${money(row.revenue)}</strong></div>
      <div class="bar-track"><span style="width:${Math.max(4, Math.round((row.revenue / max) * 100))}%"></span></div>
      <div class="hint">${row.owner?.name || "Chưa có chủ"} · ${row.bike.status}</div>
    </div>`).join("") || `<div class="empty">Chưa có dữ liệu.</div>`}</div>
  </div>`;
}

function ownerFinanceTable(rows) {
  if (!rows.length) return `<div class="empty">Chưa có chủ xe.</div>`;
  return `<div class="table-wrap compact-table"><table>
    <thead><tr><th>Chủ xe</th><th>Số xe</th><th>Phiếu thuê</th><th>Doanh thu</th><th>Còn phải thu</th><th>Chi phí sửa</th><th>Lợi nhuận</th></tr></thead>
    <tbody>${rows.map((row) => `<tr>
      <td><strong>${row.owner.name}</strong><br><span class="hint">${row.owner.type}</span></td>
      <td>${row.bikeCount}</td>
      <td>${row.rentalCount}</td>
      <td class="money">${money(row.revenue)}</td>
      <td>${money(row.receivable)}</td>
      <td>${money(row.repairCost)}</td>
      <td class="money">${money(row.profit)}</td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function notificationsView() {
  const rows = getDb().notifications;
  return `
    ${pageHeader("Thông báo", "Chuông thông báo và số lượng chưa đọc.", `<button class="secondary" data-action="mark-read">Đánh dấu đã đọc</button>`)}
    <div class="timeline">${rows.map((n) => `<div class="timeline-item"><strong>${n.title} ${!n.read ? "<span class='badge'>Mới</span>" : ""}</strong><span>${n.message}</span><span class="hint">${n.type}  · ${formatDateTime(n.createdAt)}</span></div>`).join("") || `<div class="empty">Chưa có thông báo.</div>`}</div>
  `;
}

function hrView() {
  const db = getDb();
  const employees = filterRows(db.hrEmployees || [], ["code", "name", "phone", "email", "position", "department", "status"]);
  const applicants = filterRows(db.jobApplicants || [], ["code", "name", "phone", "email", "position", "source", "status"]);
  const activeCount = (db.hrEmployees || []).filter((item) => ["Đang làm", "Thử việc"].includes(item.status)).length;
  const interviewCount = (db.jobApplicants || []).filter((item) => ["Mới", "Phỏng vấn"].includes(item.status)).length;
  const payroll = (db.hrEmployees || []).filter((item) => item.status !== "Nghỉ việc").reduce((sum, item) => sum + Number(item.salary || 0), 0);
  const filterOptions = ["Đang làm", "Thử việc", "Nghỉ việc", "Mới", "Phỏng vấn", "Đạt", "Không đạt", "Đã tuyển"];
  return `
    ${pageHeader("Quản lý nhân sự", "Theo dõi nhân viên đang làm, hồ sơ người xin việc, thông tin liên hệ, hợp đồng và lương dự kiến.", `
      <button class="primary" data-modal="hrEmployee">Th\u00eam nh\u00e2n vi\u00ean</button>
      <button class="secondary" data-modal="applicant">Th\u00eam \u1ee9ng vi\u00ean</button>
    `)}
    <div class="grid cols-4">
      ${metric("Nhân viên đang làm", activeCount)}
      ${metric("Ứng viên mở", interviewCount)}
      ${metric("Quỹ lương tháng", money(payroll))}
      ${metric("Phòng ban", new Set((db.hrEmployees || []).map((item) => item.department).filter(Boolean)).size)}
    </div>
    ${filters(filterOptions)}
    <div class="grid cols-2">
      <div class="card">
        <div class="panel-title"><h3>Nhân viên đang làm</h3><span class="pill success">${employees.length} hồ sơ</span></div>
        <div class="table-wrap compact-table"><table>
          <thead><tr><th>Ảnh</th><th>Mã</th><th>Nhân viên</th><th>Bộ phận</th><th>Ngày vào</th><th>Lương</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>${employees.map((item) => `<tr>
            <td>${personAvatar(item)}</td>
            <td><strong>${item.code}</strong></td>
            <td><strong>${item.name}</strong><br><span class="hint">${item.phone}  · ${item.email || "-"}</span></td>
            <td>${item.position}<br><span class="hint">${item.department}</span></td>
            <td>${formatDate(item.startDate)}<br><span class="hint">${item.contractType}</span></td>
            <td>${money(item.salary)}</td>
            <td>${pill(item.status)}</td>
            <td><button class="ghost" data-modal="hrEmployee:${item.id}">Sửa</button></td>
          </tr>`).join("") || `<tr><td colspan="8" class="empty">Chưa có hồ sơ nhân viên.</td></tr>`}</tbody>
        </table></div>
      </div>
      <div class="card">
        <div class="panel-title"><h3>Người xin việc</h3><span class="pill warning">${applicants.length} hồ sơ</span></div>
        <div class="table-wrap compact-table"><table>
          <thead><tr><th>Ảnh</th><th>Mã</th><th>Ứng viên</th><th>Số điện thoại</th><th>Vị trí</th><th>Nộp hồ sơ</th><th>Lương mong muốn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
          <tbody>${applicants.map((item) => `<tr>
            <td>${personAvatar(item)}</td>
            <td><strong>${item.code}</strong></td>
            <td><strong>${item.name}</strong><br><span class="hint">${item.email || "-"}</span></td>
            <td><strong>${item.phone || "-"}</strong></td>
            <td>${item.position}<br><span class="hint">${item.source}</span></td>
            <td>${formatDate(item.applyDate)}<br><span class="hint">PV: ${item.interviewDate ? formatDate(item.interviewDate) : "Chưa hẹn"}</span></td>
            <td>${money(item.expectedSalary)}</td>
            <td>${pill(item.status)}</td>
            <td><button class="ghost" data-modal="applicant:${item.id}">Sửa</button></td>
          </tr>`).join("") || `<tr><td colspan="9" class="empty">Chưa có hồ sơ ứng viên.</td></tr>`}</tbody>
        </table></div>
      </div>
    </div>
    ${attendanceSection(db)}
  `;
}

function attendanceSection(db = getDb()) {
  const records = attendanceFilteredRecords(db);
  const summary = attendanceSummaryRows(db, records);
  const totalDays = summary.reduce((sum, row) => sum + row.workDays, 0);
  const totalHours = summary.reduce((sum, row) => sum + row.hours, 0);
  const lateCount = records.filter((record) => record.status === "Đi trễ").length;
  const absentCount = records.filter((record) => ["Vắng", "Nghỉ phép"].includes(record.status)).length;
  return `
    <div class="card attendance-card">
      <div class="panel-title">
        <div><h3>Chấm công nhân viên</h3><span class="hint">Theo dõi theo ngày, tháng, năm và lọc theo ca làm việc.</span></div>
        <div class="actions">
          <button class="primary" data-modal="attendanceRecord">Chấm công</button>
          <button class="secondary" data-modal="attendanceShift">Thêm ca</button>
          <button class="ghost" data-action="export-attendance-xls">Xuất Excel</button>
          <button class="ghost" data-action="print-attendance-pdf">Xuất PDF</button>
        </div>
      </div>
      ${attendanceControls(db)}
      <div class="grid cols-4">
        ${metric("Ngày công", totalDays.toFixed(1))}
        ${metric("Tổng giờ", totalHours.toFixed(1))}
        ${metric("Đi trễ", lateCount)}
        ${metric("Nghỉ/vắng", absentCount)}
      </div>
      <div class="grid cols-2">
        <div>
          <div class="panel-title"><h3>Tổng hợp công</h3><span class="pill">${summary.length} nhân viên</span></div>
          <div class="table-wrap compact-table"><table id="attendance-summary-table">
            <thead><tr><th>Nhân viên</th><th>Bộ phận</th><th>Ngày công</th><th>Giờ công</th><th>Đi trễ</th><th>Nghỉ/vắng</th></tr></thead>
            <tbody>${summary.map((row) => `<tr>
              <td><strong>${row.employee.code}  · ${row.employee.name}</strong></td>
              <td>${row.employee.department}<br><span class="hint">${row.employee.position}</span></td>
              <td>${row.workDays.toFixed(1)}</td>
              <td>${row.hours.toFixed(1)}</td>
              <td>${row.late}</td>
              <td>${row.absent}</td>
            </tr>`).join("") || `<tr><td colspan="6" class="empty">Chưa có dữ liệu chấm công theo bộ lọc.</td></tr>`}</tbody>
          </table></div>
        </div>
        <div>
          <div class="panel-title"><h3>Ca làm việc</h3><span class="pill">${db.attendanceShifts.length} ca</span></div>
          <div class="shift-list">${db.attendanceShifts.map((shift) => `<div class="shift-item">
            <span><strong>${shift.name}</strong><small>${shift.start} - ${shift.end}  · Nghỉ ${shift.breakMinutes || 0} ph phút</small></span>
            <button class="ghost" data-modal="attendanceShift:${shift.id}">Sửa</button>
          </div>`).join("")}</div>
        </div>
      </div>
      <div class="panel-title"><h3>Chi tiết chấm công</h3><span class="pill muted">${records.length} dòng</span></div>
      <div class="table-wrap compact-table"><table id="attendance-detail-table">
        <thead><tr><th>Ngày</th><th>Nhân viên</th><th>Ca</th><th>Vào</th><th>Ra</th><th>Giờ công</th><th>Trạng thái</th><th>Ghi chú</th><th>Thao tác</th></tr></thead>
        <tbody>${records.map((record) => {
          const employee = db.hrEmployees.find((item) => item.id === record.employeeId) || {};
          const shift = db.attendanceShifts.find((item) => item.id === record.shiftId) || {};
          return `<tr>
            <td>${formatDate(record.date)}</td>
            <td><strong>${employee.name || "-"}</strong><br><span class="hint">${employee.code || ""}</span></td>
            <td>${shift.name || "-"}<br><span class="hint">${shift.start || ""} - ${shift.end || ""}</span></td>
            <td>${record.checkIn || "-"}</td>
            <td>${record.checkOut || "-"}</td>
            <td>${attendanceHours(record, shift).toFixed(1)}</td>
            <td>${pill(record.status)}</td>
            <td>${record.note || ""}</td>
            <td><button class="ghost" data-modal="attendanceRecord:${record.id}">Sửa</button></td>
          </tr>`;
        }).join("") || `<tr><td colspan="9" class="empty">Chưa có dữ liệu chấm công theo bộ lọc.</td></tr>`}</tbody>
      </table></div>
    </div>
  `;
}

function attendanceControls(db) {
  return `<div class="attendance-controls">
    <select data-attendance-filter="period">
      ${[["day", "Theo ngày"], ["month", "Theo tháng"], ["year", "Theo năm"]].map(([value, label]) => `<option value="${value}" ${state.attendance.period === value ? "selected" : ""}>${label}</option>`).join("")}
    </select>
    <input data-attendance-filter="date" type="date" value="${state.attendance.date}">
    <input data-attendance-filter="month" type="month" value="${state.attendance.month}">
    <input data-attendance-filter="year" type="number" min="2020" max="2100" value="${state.attendance.year}">
    <select data-attendance-filter="shift">
      <option value="all">Tất cả ca</option>
      ${db.attendanceShifts.map((shift) => `<option value="${shift.id}" ${state.attendance.shift === shift.id ? "selected" : ""}>${shift.name}</option>`).join("")}
    </select>
  </div>`;
}

function attendanceFilteredRecords(db = getDb()) {
  const { period, date, month, year, shift } = state.attendance;
  return (db.attendanceRecords || []).filter((record) => {
    const matchesTime = period === "day"
      ? record.date === date
      : period === "month"
        ? record.date.slice(0, 7) === month
        : record.date.slice(0, 4) === String(year);
    const matchesShift = shift === "all" || record.shiftId === shift;
    return matchesTime && matchesShift;
  }).sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function attendanceSummaryRows(db = getDb(), records = attendanceFilteredRecords(db)) {
  return (db.hrEmployees || [])
    .filter((employee) => employee.status !== "Nghỉ việc")
    .map((employee) => {
      const employeeRecords = records.filter((record) => record.employeeId === employee.id);
      const workDays = employeeRecords.reduce((sum, record) => sum + attendanceDayValue(record.status), 0);
      const hours = employeeRecords.reduce((sum, record) => {
        const shift = db.attendanceShifts.find((item) => item.id === record.shiftId) || {};
        return sum + attendanceHours(record, shift);
      }, 0);
      return {
        employee,
        workDays,
        hours,
        late: employeeRecords.filter((record) => record.status === "Đi trễ").length,
        absent: employeeRecords.filter((record) => ["Vắng", "Nghỉ phép"].includes(record.status)).length
      };
    })
    .filter((row) => row.workDays || row.hours || row.late || row.absent);
}

function attendanceDayValue(status) {
  if (status === "Nửa ngày") return 0.5;
  if (["Vắng", "Nghỉ phép"].includes(status)) return 0;
  return 1;
}

function attendanceHours(record, shift = {}) {
  if (!record.checkIn || !record.checkOut || ["Vắng", "Nghỉ phép"].includes(record.status)) return 0;
  const start = timeToMinutes(record.checkIn);
  const end = timeToMinutes(record.checkOut);
  const minutes = Math.max(0, end - start - Number(shift.breakMinutes || 0));
  return Math.round((minutes / 60) * 10) / 10;
}

function timeToMinutes(value) {
  const [hour = 0, minute = 0] = String(value || "0:0").split(":").map(Number);
  return hour * 60 + minute;
}

function usersView() {
  const rows = getDb().users;
  return `
    ${pageHeader("Nhân viên", "Admin tạo một hoặc nhiều tài khoản, bật/tắt tài khoản và cấu hình quyền chi tiết.", `<button class="primary" data-modal="user">Th\u00eam nh\u00e2n vi\u00ean</button>`)}
    <div class="table-wrap"><table><thead><tr><th>Nhân viên</th><th>Email</th><th>Vai trò</th><th>Quyền</th><th>Đăng nhập gần nhất</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>
      ${rows.map((u) => `<tr>
        <td><strong>${u.name}</strong>${u.id === state.user.id ? "<br><span class='hint'>Tài khoản hiện tại</span>" : ""}</td>
        <td>${u.email}</td>
        <td>${roles[u.role]}</td>
        <td>${permissionSummary(u)}</td>
        <td><strong>${u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Chưa đăng nhập"}</strong>${u.id === state.user.id ? "<br><span class='hint'>Phiên đang dùng</span>" : ""}</td>
        <td>${pill(u.active ? "Hoạt động" : "Ngừng")}</td>
        <td><div class="actions"><button class="secondary" data-modal="user:${u.id}">Sửa quyền</button></div></td>
      </tr>`).join("")}
    </tbody></table></div>
  `;
}

function permissionSummary(user) {
  if (user.role === "admin") return `<span class="pill success">Toàn quyền</span>`;
  const list = Array.isArray(user.permissions) ? user.permissions : permissions[user.role] || [];
  const labels = list.map((key) => permissionCatalog.find(([id]) => id === key)?.[1] || key);
  return `<span class="hint">${labels.slice(0, 3).join(", ")}${labels.length > 3 ? ` +${labels.length - 3}` : ""}</span>`;
}

function auditView() {
  const db = getDb();
  const filters = state.auditFilters;
  const rows = filteredAuditRows(db.auditLogs);
  const users = [...new Set(db.auditLogs.map((log) => log.user).filter(Boolean))];
  const roleOptions = [...new Set(db.auditLogs.map((log) => log.role).filter(Boolean))];
  const actionOptions = [...new Set(db.auditLogs.map((log) => log.action).filter(Boolean))];
  return `
    ${pageHeader("Nhật ký hoạt động", "Ghi lại người thực hiện, vai trò, hành động, bản ghi và thời gian.", "")}
    <div class="audit-filter-panel">
      <div class="audit-filter-title">
        <strong>Bộ lọc nhật ký</strong>
        <span>Hiển thị ${rows.length} / ${db.auditLogs.length} dòng</span>
      </div>
      <div class="audit-filter-grid">
        <input type="search" placeholder="Tìm người dùng, hành động, bản ghi..." value="${filters.query}" data-audit-filter="query">
        <select data-audit-filter="user"><option value="all">Tất cả người dùng</option>${users.map((user) => `<option value="${user}" ${filters.user === user ? "selected" : ""}>${user}</option>`).join("")}</select>
        <select data-audit-filter="role"><option value="all">Tất cả vai trò</option>${roleOptions.map((role) => `<option value="${role}" ${filters.role === role ? "selected" : ""}>${role}</option>`).join("")}</select>
        <select data-audit-filter="action"><option value="all">Tất cả hành động</option>${actionOptions.map((action) => `<option value="${action}" ${filters.action === action ? "selected" : ""}>${action}</option>`).join("")}</select>
        <input type="date" value="${filters.date}" data-audit-filter="date">
        <button class="ghost" type="button" data-action="reset-audit-filters">Xóa lọc</button>
      </div>
    </div>
    <div class="table-wrap"><table><thead><tr><th>Thời gian</th><th>Người dùng</th><th>Vai trò</th><th>Hành động</th><th>Bản ghi</th></tr></thead><tbody>
      ${rows.map((l) => `<tr><td>${formatDateTime(l.createdAt)}</td><td>${l.user}</td><td>${l.role}</td><td>${l.action}</td><td>${l.record}</td></tr>`).join("") || `<tr><td colspan="5" class="empty">Chưa có nhật ký.</td></tr>`}
    </tbody></table></div>
  `;
}

function filteredAuditRows(logs = []) {
  const filters = state.auditFilters;
  const query = String(filters.query || "").trim().toLowerCase();
  return logs.filter((log) => {
    const matchesQuery = !query || [log.user, log.role, log.action, log.record, log.before, log.after].some((value) => String(value || "").toLowerCase().includes(query));
    const matchesUser = filters.user === "all" || log.user === filters.user;
    const matchesRole = filters.role === "all" || log.role === filters.role;
    const matchesAction = filters.action === "all" || log.action === filters.action;
    const matchesDate = !filters.date || String(log.createdAt || "").slice(0, 10) === filters.date;
    return matchesQuery && matchesUser && matchesRole && matchesAction && matchesDate;
  }).slice(0, 120);
}

function settingsView() {
  const s = getDb().settings;
  return `
    ${pageHeader("Cài đặt", "Thiết lập hệ thống, sao lưu dữ liệu và quy tắc hiển thị.", "")}
    <div class="grid cols-2">
      <div class="card">
        <h3>Hệ thống</h3>
        <p><strong>Múi giờ:</strong> ${s.timezone}</p>
        <p><strong>Tiền tệ:</strong> ${s.currency}</p>
        <p><strong>Ngày:</strong> ${s.dateFormat}</p>
      </div>
      <div class="card">
        <h3>Sao lưu và dữ liệu</h3>
        <p class="hint">Tải database JSON và gói website ZIP để lưu trữ hoặc chuyển sang máy/hosting khác.</p>
        <div class="actions">
          <button class="secondary" type="button" data-action="backup-json">Sao lưu database JSON</button>
          <label class="secondary import-json-button" for="import-json-file">Nhập JSON lên MySQL</label>
          <input id="import-json-file" class="visually-hidden" type="file" accept=".json,application/json" data-import-json>
          <button class="secondary" type="button" data-action="backup-website">Backup website ZIP</button>
        </div>
      </div>
    </div>
  `;
}

function pageHeader(title, subtitle, actionHtml) {
  return `<div class="toolbar"><div><h2 class="section-title">${title}</h2><div class="hint">${subtitle}</div></div><div class="actions">${actionHtml || ""}</div></div>`;
}

function filters(options) {
  return `<div class="toolbar"><div class="filters">
    <input type="search" placeholder="Tìm kiếm..." value="${state.query}" data-filter="query">
    ${options.length ? `<select data-filter="status"><option value="all">TTất cả</option>${options.map((o) => `<option value="${o}" ${state.filter === o ? "selected" : ""}>${o}</option>`).join("")}</select>` : ""}
  </div><span class="hint">Có tìm kiếm, lọc, sắp xếp và phân trang rút gọn theo màn hình.</span></div>`;
}

function filterRows(rows, fields) {
  const q = state.query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesQuery = !q || fields.some((field) => String(row[field] || "").toLowerCase().includes(q));
    const matchesFilter = state.filter === "all" || Object.values(row).includes(state.filter);
    return matchesQuery && matchesFilter;
  }).slice(0, 50);
}

function pill(text) {
  return `<span class="pill ${statusClass(text)}">${text}</span>`;
}

function bikeStatusControl(bike) {
  const dueWarning = isBikeOilDue(bike) || isBikeMaintenanceKmDue(bike);
  return `<div class="status-control">
    <div>${pill(bike.status)}${dueWarning ? `<br><span class="pill warning">Sắp đến hạn</span>` : ""}</div>
    <select data-bike-status="${bike.id}" aria-label="Cập nhật trạng thái ${bike.code}">
      ${bikeStatuses.map((status) => `<option value="${status}" ${bike.status === status ? "selected" : ""}>${status}</option>`).join("")}
    </select>
  </div>`;
}

function assetName(t) {
  const db = getDb();
  const asset = t.assetType === "Xe máy" ? db.motorbikes.find((b) => b.id === t.assetId) : db.equipment.find((e) => e.id === t.assetId);
  return asset ? `${asset.code} · ${asset.name}` : "-";
}

function rentalBikeIds(rental) {
  if (Array.isArray(rental.bikeIds) && rental.bikeIds.length) return rental.bikeIds.filter(Boolean);
  return rental.bikeId ? [rental.bikeId] : [];
}

function dateInMonth(value, month) {
  if (!value || !month) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return localDateKey(date).slice(0, 7) === month;
}

function ownerRevenueRows(db = getDb(), month = "") {
  return db.owners.map((owner) => {
    const bikes = db.motorbikes.filter((bike) => bike.ownerId === owner.id);
    const bikeIds = new Set(bikes.map((bike) => bike.id));
    const rentals = db.rentals.filter((rental) => {
      const hasOwnerBike = rentalBikeIds(rental).some((bikeId) => bikeIds.has(bikeId));
      if (!hasOwnerBike || rental.status === "Đã hủy") return false;
      return month ? rentalDayKeysInMonth(rental, month).length > 0 : true;
    });
    const tickets = db.tickets.filter((ticket) => {
      if (ticket.assetType !== "Xe máy" || !bikeIds.has(ticket.assetId)) return false;
      return month ? dateInMonth(ticket.foundDate || ticket.createdAt || ticket.dueDate, month) : true;
    });
    const revenue = rentals.reduce((sum, rental) => {
      const matchedCount = rentalBikeIds(rental).filter((bikeId) => bikeIds.has(bikeId)).length || 1;
      const totalBikeCount = rentalBikeIds(rental).length || 1;
      return sum + (Number(rental.paid || 0) / totalBikeCount) * matchedCount;
    }, 0);
    const receivable = rentals.reduce((sum, rental) => {
      const matchedCount = rentalBikeIds(rental).filter((bikeId) => bikeIds.has(bikeId)).length || 1;
      const totalBikeCount = rentalBikeIds(rental).length || 1;
      const unpaid = Math.max(0, Number(rental.total || 0) - Number(rental.paid || 0));
      return sum + (unpaid / totalBikeCount) * matchedCount;
    }, 0);
    const repairCost = tickets.reduce((sum, ticket) => sum + Number(ticket.actualCost || ticket.estimatedCost || 0), 0);
    return {
      owner,
      bikeCount: bikes.length,
      rentalCount: rentals.length,
      revenue,
      receivable,
      repairCost,
      profit: revenue - repairCost
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

function modalView() {
  const [type, id, extra] = state.modal.split(":");
  const db = getDb();
  const close = `<button class="ghost" data-action="close-modal">Đóng</button>`;
  if (type === "bikeDetail") return detailBikeModal(db.motorbikes.find((b) => b.id === id));
  if (type === "bikeKm") return bikeKmModal(db.motorbikes.find((b) => b.id === id));
  if (type === "return") return returnModal(db.rentals.find((r) => r.id === id));
  if (type === "booking" && ((id && !can("booking_edit")) || (!id && !can("booking_write")))) {
    return `<div class="modal-backdrop"><div class="modal"><header><h3>Kh\u00f4ng \u0111\u1ee7 quy\u1ec1n</h3>${close}</header><div class="modal-body"><p class="empty">T\u00e0i kho\u1ea3n n\u00e0y ch\u01b0a \u0111\u01b0\u1ee3c c\u1ea5p quy\u1ec1n ghi ho\u1eb7c s\u1eeda l\u1ecbch \u0111\u1eb7t ph\u00f2ng.</p></div></div></div>`;
  }

  const titleMap = { room: "Ph\u00f2ng", hotel: "Kh\u00e1ch s\u1ea1n", booking: "\u0110\u1eb7t ph\u00f2ng", bike: "Xe máy", bikeType: "Loại xe", rental: "Phiếu thuê", ticket: "Phiếu sửa chữa", ticketEdit: "Cập nhật phiếu", equipment: "Thiết bị", equipmentType: "Loại thiết bị", owner: "Chủ xe", hrEmployee: "hồ sơ nhân viên", applicant: "hồ sơ ứng viên", attendanceRecord: "dòng chấm công", attendanceShift: "ca làm việc", user: "Nhân viên" };
  return `<div class="modal-backdrop"><form class="modal" id="modal-form" data-form="${type}" data-id="${id || ""}" data-extra="${extra || ""}">
    <header><h3>${id ? "Cập nhật" : "Thêm"} ${titleMap[type] || ""}</h3>${close}</header>
    <div class="modal-body">${modalFields(type, id, extra)}</div>
    <footer>${type === "booking" && id && can("booking_edit") ? `<button class="danger" type="button" data-action="delete-booking:${id}">X\u00f3a \u0111\u1eb7t ph\u00f2ng</button>` : ""}<button class="ghost" type="button" data-action="close-modal">H\u1ee7y</button><button class="primary" type="submit">L\u01b0u</button></footer>
  </form></div>`;
}

function modalFields(type, id, extra) {
  if (type === "hotel") return hotelForm(id);
  if (type === "room") return roomForm(id);
  if (type === "booking") return bookingForm(id);
  if (type === "bike") return bikeForm(id);
  if (type === "bikeType") return bikeTypeForm(id);
  if (type === "rental") return rentalForm(id);
  if (type === "ticket" || type === "ticketEdit") return ticketForm(type === "ticketEdit" ? id : "", id, extra);
  if (type === "equipment") return equipmentForm(id);
  if (type === "equipmentType") return equipmentTypeForm(id);
  if (type === "owner") return ownerForm(id);
  if (type === "hrEmployee") return hrEmployeeForm(id);
  if (type === "applicant") return applicantForm(id);
  if (type === "attendanceRecord") return attendanceRecordForm(id);
  if (type === "attendanceShift") return attendanceShiftForm(id);
  if (type === "user") return userForm(id);
  return "";
}

function bikeForm(id) {
  const db = getDb();
  const b = db.motorbikes.find((x) => x.id === id) || {};
  if (!state.bikeImageDraft || state.bikeImageDraft.formId !== (id || "new")) {
    state.bikeImageDraft = { formId: id || "new", images: [...(b.images || [])], deletedImages: [] };
  }
  const draftImages = state.bikeImageDraft.images || [];
  const ownerOptions = db.owners
    .filter((owner) => !owner.hidden || owner.id === b.ownerId)
    .map((owner) => [owner.id, `${owner.name} · ${owner.type}${owner.hidden ? " · Đang ẩn" : ""}`]);
  const typeOptions = (db.bikeTypes || []).map((type) => [type.name, type.name]);
  const selectedType = (db.bikeTypes || []).find((type) => type.name === (b.type || typeOptions[0]?.[0]));
  return `<div class="form-grid">
    ${field("code", "Mã xe", b.code, true)}${field("plate", "Biển số", b.plate, true)}
    ${field("name", "Tên xe", b.name, true)}${selectField("type", "Loại xe", typeOptions.length ? typeOptions : ["Tay ga", "Xe số", "Xe điện"], b.type || selectedType?.name)}
    ${field("brand", "Hãng xe", b.brand)}${field("model", "Dòng xe", b.model)}
    ${field("color", "Màu sắc", b.color)}${selectField("status", "Trạng thái", bikeStatuses, b.status || "Có sẵn")}
    ${selectField("ownerId", "Chủ xe", ownerOptions.length ? ownerOptions : [["", "Chưa có chủ xe"]], b.ownerId || db.owners.find((owner) => !owner.hidden)?.id || db.owners[0]?.id || "", true)}
    ${selectField("ownership", "Hình thức sở hữu", ["Khách sạn sở hữu", "Ký gửi", "Thuê ngoài"], b.ownership || "Khách sạn sở hữu")}
    ${field("weekdayPrice", "Giá ngày thường", b.weekdayPrice || 180000, true, "number")}${field("weekendPrice", "Giá cuối tuần", b.weekendPrice || 220000, true, "number")}
    ${field("holidayPrice", "Giá ngày lễ", b.holidayPrice || 260000, true, "number")}${field("odometer", "Kilomet hiện tại", b.odometer || 0, false, "number")}
    ${field("fuel", "Mức nhiên liệu", b.fuel || "100%")}
    ${field("lastOilChangeDate", "Ngày thay nhớt gần nhất", b.lastOilChangeDate || todayISO(), false, "date")}
    ${field("lastOilChangeKm", "Km lần thay nhớt gần nhất", b.lastOilChangeKm ?? Math.max(0, Number(b.odometer || 0) - 1200), false, "number")}
    ${field("oilChangeIntervalKm", "Nhắc thay nhớt mỗi bao nhiêu km", b.oilChangeIntervalKm || selectedType?.oilChangeIntervalKm || 1500, false, "number")}
    ${field("lastMaintenanceKm", "Km lần bảo trì gần nhất", b.lastMaintenanceKm ?? Math.max(0, Number(b.odometer || 0) - 2500), false, "number")}
    ${field("maintenanceIntervalKm", "Nhắc bảo trì mỗi bao nhiêu km", b.maintenanceIntervalKm || selectedType?.maintenanceIntervalKm || 3000, false, "number")}
    ${field("lastMaintenance", "Bảo trì gần nhất", b.lastMaintenance || todayISO(), false, "date")}${field("nextMaintenance", "Bảo trì tiếp theo", b.nextMaintenance || todayISO(30), false, "date")}
    <div class="field full">
      <label>Hình ảnh xe và giấy tờ (tối đa ${BIKE_IMAGE_LIMIT} hình, hình đầu tiên là ảnh đại diện)</label>
      <input name="bikeImages" type="file" accept="image/*" multiple>
      <div class="image-grid" id="bike-image-preview">
        ${renderEditableBikeImages(draftImages)}
      </div>
    </div>
    <div class="field full"><label>Ghi chú</label><textarea name="notes">${b.notes || ""}</textarea></div>
  </div>`;
}

function renderEditableBikeImages(images = []) {
  if (!images.length) return `<span>Chưa có hình. Chọn tối đa ${BIKE_IMAGE_LIMIT} hình để lưu cùng xe.</span>`;
  return images.map((src, index) => `<div class="image-thumb ${isLikelyBrokenImage(src) ? "image-load-error" : ""}">
    <img src="${src}" alt="Hình xe ${index + 1}" onerror="this.closest('.image-thumb')?.classList.add('image-load-error')">
    <div class="image-thumb-zoom"><img src="${src}" alt="Hình xe ${index + 1} phóng to"></div>
    <strong class="image-error-label">Ảnh lỗi, hãy xóa và tải lại</strong>
    <button type="button" data-action="remove-bike-image:${index}" title="Xóa hình này">×</button>
    ${index === 0 ? `<small>Ảnh đại diện</small>` : ""}
  </div>`).join("");
}

function isLikelyBrokenImage(src = "") {
  const value = String(src || "");
  return value.startsWith("data:image/") && value.length < 1800;
}

function bikeTypeForm(id) {
  const type = getDb().bikeTypes.find((x) => x.id === id) || {};
  return `<div class="form-grid">
    ${field("name", "Tên loại xe", type.name, true)}
    ${field("oilChangeIntervalKm", "Chu kỳ thay nhớt (km)", type.oilChangeIntervalKm || 1500, false, "number")}
    ${field("maintenanceIntervalKm", "Chu kỳ bảo trì tổng quát (km)", type.maintenanceIntervalKm || 3000, false, "number")}
    <div class="field full"><label>Checklist bảo trì</label><textarea name="checklist" placeholder="Ví dụ: thay nhớt, kiểm tra thắng, lốp, đèn, bình điện...">${type.checklist || ""}</textarea></div>
    <div class="field full"><label>Ghi chú</label><textarea name="note">${type.note || ""}</textarea></div>
  </div>`;
}

function rentalForm(id) {
  const db = getDb();
  const r = db.rentals.find((x) => x.id === id) || {};
  const bikes = id
    ? db.motorbikes.filter((b) => b.status === "Có sẵn" || b.id === r.bikeId)
    : db.motorbikes.filter((b) => b.status !== "Ngừng sử dụng");
  const bikePicker = id
    ? selectField("bikeId", "Xe thuê", bikes.map((b) => [b.id, `${b.code}  · ${b.name}`]), r.bikeId, true)
    : multiBikeRentalPicker(bikes);
  return `<div class="form-grid">
    ${field("customer", "Tên khách", r.customer, true)}${field("phone", "Số điện thoại", r.phone, true)}
    ${field("room", "Số phòng", r.room)}${bikePicker}
    ${field("start", "Thời gian nhận", r.start || `${todayISO()}T09:00`, true, "datetime-local")}${field("end", "Thời gian trả", r.end || `${todayISO(1)}T09:00`, true, "datetime-local")}
    ${field("price", "Đơn giá", r.price || 180000, true, "number")}${field("surcharge", "Phụ thu", r.surcharge || 0, false, "number")}
    ${field("discount", "Giảm giá", r.discount || 0, false, "number")}${field("deposit", "Tiền cọc", r.deposit || 0, false, "number")}
    ${field("paid", "Đã thanh toán", r.paid || 0, false, "number")}${selectField("paymentMethod", "Phương thức", ["Tiền mặt", "Chuyển khoản", "Thẻ", "Chưa thanh toán"], r.paymentMethod || "Tiền mặt")}
    ${selectField("status", "Trạng thái", rentalStatuses, r.status || "Đã đặt")}
    <div class="field full"><label>Ghi chú</label><textarea name="notes">${r.notes || ""}</textarea></div>
  </div>`;
}

function multiBikeRentalPicker(bikes) {
  const firstAvailableIndex = bikes.findIndex((bike) => bike.status === "Có sẵn");
  const defaultIndex = firstAvailableIndex >= 0 ? firstAvailableIndex : 0;
  return `
    <div class="field full">
      <label>Xe thuê <span class="hint">Chọn 1 hoặc nhiều xe. Có thể cuộn danh sách trên điện thoại để chọn xe khác.</span></label>
      <div class="multi-bike-picker">
        ${bikes.map((bike, index) => {
          const available = bike.status === "Có sẵn";
          return `
          <label class="multi-bike-option ${available ? "" : "unavailable"} ${index === defaultIndex ? "selected" : ""}">
            <input type="checkbox" name="bikeIds" value="${bike.id}" ${index === defaultIndex ? "checked" : ""}>
            <span class="multi-bike-check" aria-hidden="true"></span>
            <span class="multi-bike-info"><strong>${bike.code} · ${bike.name}</strong><small>${bike.plate || "-"} · ${bike.type || ""}</small></span>
            <span class="multi-bike-status">${pill(bike.status)}</span>
          </label>
        `;
        }).join("") || `<p class="hint">Chưa có xe trong danh sách.</p>`}
      </div>
      ${firstAvailableIndex < 0 ? `<span class="hint warning-text">Không có xe “Có sẵn”. Admin vẫn có thể chọn xe để xử lý ngoại lệ, nhưng hệ thống sẽ chặn nếu trùng lịch thuê.</span>` : ""}
    </div>
  `;
}

function ticketForm(editId, assetType = "Xe máy", preselectedAssetId = "") {
  const db = getDb();
  const t = db.tickets.find((x) => x.id === editId) || { assetType, assetId: preselectedAssetId };
  const assets = (t.assetType === "Thiết bị" || assetType === "Thiết bị" ? db.equipment : db.motorbikes).map((a) => [a.id, `${a.code} · ${a.name}`]);
  return `<div class="form-grid">
    ${selectField("assetType", "Loại tài sản", ["Xe máy", "Thiết bị"], t.assetType || assetType)}
    ${selectField("assetId", "Tài sản liên quan", assets, t.assetId, true)}
    <div class="field full"><label>Mô tả lỗi</label><textarea name="issue" required>${t.issue || ""}</textarea></div>
    ${selectField("priority", "Mức độ ưu tiên", ["Thấp", "Trung bình", "Cao", "Khẩn cấp"], t.priority || "Trung bình")}
    ${selectField("assigneeId", "Người phụ trách", db.users.filter((u) => u.role === "technician").map((u) => [u.id, u.name]), t.assigneeId || "u-tech")}
    ${field("foundDate", "Ngày phát hiện", t.foundDate || todayISO(), false, "date")}${field("dueDate", "Dự kiến hoàn thành", t.dueDate || todayISO(2), false, "date")}
    ${field("estimatedCost", "Chi phí dự kiến", t.estimatedCost || 0, false, "number")}${field("actualCost", "Chi phí thực tế", t.actualCost || 0, false, "number")}
    ${selectField("status", "Trạng thái", ticketStatuses, t.status || "Mới tạo")}
    <div class="field full"><label>Nguyên nhân</label><textarea name="cause">${t.cause || ""}</textarea></div>
    <div class="field full"><label>Phương án xử lý</label><textarea name="solution">${t.solution || ""}</textarea></div>
    <div class="field full"><label>Phụ tùng thay thế</label><textarea name="parts">${t.parts || ""}</textarea></div>
  </div>`;
}

function equipmentForm(id) {
  const db = getDb();
  const e = db.equipment.find((x) => x.id === id) || {};
  const typeOptions = (db.equipmentTypes || []).map((type) => [type.name, type.name]);
  const selectedType = (db.equipmentTypes || []).find((type) => type.name === (e.type || typeOptions[0]?.[0]));
  return `<div class="form-grid">
    ${field("code", "Mã thiết bị", e.code, true)}${field("name", "Tên thiết bị", e.name, true)}
    ${selectField("type", "Loại", typeOptions.length ? typeOptions : ["Máy lạnh", "Máy giặt", "Tivi", "Tủ lạnh", "Máy nước nóng", "Máy bơm", "Tủ đông", "Thiết bị cafe", "Thiết bị khác"], e.type || selectedType?.name || "Máy lạnh")}
    ${field("brand", "Thương hiệu", e.brand)}${field("model", "Model", e.model)}${field("serial", "Serial", e.serial)}
    ${field("power", "Công suất", e.power)}${field("room", "Phòng", e.room)}${field("floor", "Tầng", e.floor)}${field("area", "Khu vực", e.area)}
    ${field("purchaseDate", "Ngày mua", e.purchaseDate || todayISO(), false, "date")}${field("installDate", "Ngày lắp đặt", e.installDate || todayISO(), false, "date")}
    ${field("supplier", "Nhà cung cấp", e.supplier)}${field("price", "Giá mua", e.price || 0, false, "number")}
    ${field("warrantyEnd", "Hết bảo hành", e.warrantyEnd || todayISO(365), false, "date")}${field("nextMaintenance", "Bảo trì tiếp theo", e.nextMaintenance || todayISO(selectedType?.maintenanceIntervalDays || 30), false, "date")}
    ${selectField("condition", "Tình trạng", ["Hoạt động", "Đang hư", "Đang sửa", "Ngừng sử dụng"], e.condition || "Hoạt động")}
    <div class="field full"><label>Thông tin cần kiểm tra theo loại</label><textarea name="maintenanceInfo" placeholder="${selectedType?.requiredFields || "Thông tin bảo trì cần lưu"}">${e.maintenanceInfo || selectedType?.requiredFields || ""}</textarea></div>
    <div class="field full"><label>Checklist bảo trì</label><textarea name="maintenanceChecklist">${e.maintenanceChecklist || selectedType?.checklist || ""}</textarea></div>
    <div class="field full"><label>Ghi chú</label><textarea name="note">${e.note || ""}</textarea></div>
  </div>`;
}

function equipmentTypeForm(id) {
  const type = getDb().equipmentTypes.find((x) => x.id === id) || {};
  return `<div class="form-grid">
    ${field("name", "Tên loại thiết bị", type.name, true)}
    ${field("maintenanceIntervalDays", "Chu kỳ bảo trì (ngày)", type.maintenanceIntervalDays || 90, false, "number")}
    ${field("warrantyAlertDays", "Báo trước hết bảo hành (ngày)", type.warrantyAlertDays || 30, false, "number")}
    <div class="field full"><label>Thông tin cần nhập</label><textarea name="requiredFields" placeholder="Ví dụ: HP/BTU, loại gas, phòng, serial...">${type.requiredFields || ""}</textarea></div>
    <div class="field full"><label>Checklist bảo trì</label><textarea name="checklist" placeholder="Ví dụ: vệ sinh, kiểm tra gas, nguồn điện, thoát nước...">${type.checklist || ""}</textarea></div>
    <div class="field full"><label>Ghi chú</label><textarea name="note">${type.note || ""}</textarea></div>
  </div>`;
}

function ownerForm(id) {
  const owner = getDb().owners.find((item) => item.id === id) || {};
  return `<div class="form-grid">
    ${field("name", "Tên chủ xe", owner.name || "", true)}
    ${field("phone", "Điện thoại", owner.phone || "")}
    ${selectField("type", "Hình thức", ["Khách sạn sở hữu", "Ký gửi", "Thuê ngoài"], owner.type || "Ký gửi")}
    ${selectField("hidden", "Trạng thái hiển thị", [["false", "Đang hiển thị"], ["true", "Đang ẩn"]], String(Boolean(owner.hidden)))}
    <div class="field full"><label>Ghi chú</label><textarea name="note">${owner.note || ""}</textarea></div>
  </div>`;
}

function hrEmployeeForm(id) {
  const item = getDb().hrEmployees.find((x) => x.id === id) || {};
  return `<div class="form-grid">
    ${field("code", "Mã nhân sự", item.code || nextCode("NS", getDb().hrEmployees), true)}
    ${field("name", "Họ và tên", item.name || "", true)}
    ${selectField("gender", "Giới tính", ["Nam", "Nữ", "Khác"], item.gender || "Nam")}
    ${field("phone", "Số điện thoại", item.phone || "", true)}
    ${field("email", "Email", item.email || "", false, "email")}
    ${field("idNumber", "CCCD/CMND", item.idNumber || "")}
    ${field("position", "Chức vụ/vị trí", item.position || "", true)}
    ${field("department", "Bộ phận", item.department || "Vận hành", true)}
    ${field("startDate", "Ngày vào làm", item.startDate || todayISO(), true, "date")}
    ${selectField("contractType", "Loại hợp đồng", ["Thử việc", "Hợp đồng thời vụ", "Hợp đồng chính thức", "Cộng tác viên"], item.contractType || "Thử việc")}
    ${field("salary", "Lương/tháng", item.salary || 0, false, "number")}
    ${selectField("status", "Trạng thái", ["Đang làm", "Thử việc", "Nghỉ việc"], item.status || "Đang làm")}
    <div class="field full">
      <label>Hình ảnh nhân viên</label>
      <input name="employeePhoto" type="file" accept="image/*">
      <div class="image-grid employee-photo-preview" id="employee-photo-preview">
        ${item.photo ? `<img src="${item.photo}" alt="Ảnh nhân viên ${item.name || item.code}">` : `<span>Chưa có ảnh. Chọn 1 hình để làm ảnh đại diện nhân viên.</span>`}
      </div>
    </div>
    <div class="field full"><label>Địa chỉ</label><textarea name="address">${item.address || ""}</textarea></div>
    <div class="field full"><label>Liên hệ khẩn cấp</label><textarea name="emergencyContact" placeholder="Tên người thân - số điện thoại">${item.emergencyContact || ""}</textarea></div>
    <div class="field full"><label>Ghi chú</label><textarea name="note">${item.note || ""}</textarea></div>
  </div>`;
}

function applicantForm(id) {
  const item = getDb().jobApplicants.find((x) => x.id === id) || {};
  return `<div class="form-grid">
    ${field("code", "Mã ứng viên", item.code || nextCode("UV", getDb().jobApplicants), true)}
    ${field("name", "Họ và tên", item.name || "", true)}
    ${selectField("gender", "Giới tính", ["Nam", "Nữ", "Khác"], item.gender || "Nam")}
    ${field("phone", "Số điện thoại", item.phone || "", true)}
    ${field("email", "Email", item.email || "", false, "email")}
    ${field("position", "Vị trí ứng tuyển", item.position || "", true)}
    ${field("source", "Nguồn ứng viên", item.source || "Facebook")}
    ${field("applyDate", "Ngày nộp hồ sơ", item.applyDate || todayISO(), true, "date")}
    ${field("interviewDate", "Ngày phỏng vấn", item.interviewDate || "", false, "date")}
    ${field("expectedSalary", "Lương mong muốn", item.expectedSalary || 0, false, "number")}
    ${selectField("status", "Trạng thái", ["Mới", "Phỏng vấn", "Đạt", "Không đạt", "Đã tuyển"], item.status || "Mới")}
    <div class="field full">
      <label>Hình ảnh ứng viên</label>
      <input name="applicantPhoto" type="file" accept="image/*">
      <div class="image-grid employee-photo-preview" id="applicant-photo-preview">
        ${item.photo ? `<img src="${item.photo}" alt="Ảnh ứng viên ${item.name || item.code}">` : `<span>Chưa có ảnh. Chọn 1 hình nhỏ để làm ảnh đại diện ứng viên.</span>`}
      </div>
    </div>
    <div class="field full"><label>Kinh nghiệm/kỹ năng</label><textarea name="experience">${item.experience || ""}</textarea></div>
    <div class="field full"><label>Ghi chú tuyển dụng</label><textarea name="note">${item.note || ""}</textarea></div>
  </div>`;
}

function attendanceRecordForm(id) {
  const db = getDb();
  const item = db.attendanceRecords.find((x) => x.id === id) || {};
  return `<div class="form-grid">
    ${selectField("employeeId", "Nhân viên", db.hrEmployees.filter((employee) => employee.status !== "Nghỉ việc").map((employee) => [employee.id, `${employee.code}  · ${employee.name}`]), item.employeeId || db.hrEmployees[0]?.id, true)}
    ${field("date", "Ngày chấm công", item.date || state.attendance.date || todayISO(), true, "date")}
    ${selectField("shiftId", "Ca làm việc", db.attendanceShifts.map((shift) => [shift.id, `${shift.name} · ${shift.start}-${shift.end}`]), item.shiftId || db.attendanceShifts[0]?.id, true)}
    ${field("checkIn", "Giờ vào", item.checkIn || "", false, "time")}
    ${field("checkOut", "Giờ ra", item.checkOut || "", false, "time")}
    ${selectField("status", "Trạng thái công", ["Đủ công", "Đi trễ", "Nửa ngày", "Tăng ca", "Nghỉ phép", "Vắng"], item.status || "Đủ công")}
    <div class="field full"><label>Ghi chú</label><textarea name="note">${item.note || ""}</textarea></div>
  </div>`;
}

function attendanceShiftForm(id) {
  const item = getDb().attendanceShifts.find((x) => x.id === id) || {};
  return `<div class="form-grid">
    ${field("name", "Tên ca", item.name || "", true)}
    ${timePickerField("start", "Giờ bắt đầu", item.start || "08:00")}
    ${timePickerField("end", "Giờ kết thúc", item.end || "17:00")}
    ${field("breakMinutes", "Thời gian nghỉ giữa ca (phút)", item.breakMinutes || 0, false, "number")}
    <div class="field full"><label>Ghi chú ca làm</label><textarea name="note">${item.note || ""}</textarea></div>
  </div>`;
}

function userForm(id) {
  const user = getDb().users.find((u) => u.id === id) || {};
  const role = user.role || "receptionist";
  const selected = new Set(Array.isArray(user.permissions) ? user.permissions : permissions[role] || []);
  const isEdit = Boolean(id);
  return `<div class="form-grid">
    ${field("name", "Tên nhân viên", user.name || "", !isEdit)}
    ${field("email", "Email đăng nhập", user.email || "", !isEdit, "email")}
    ${field("password", "Mật khẩu", user.password || "123456", !isEdit)}
    ${selectField("role", "Vai trò", Object.entries(roles), role)}
    ${selectField("active", "Trạng thái", [["true", "Hoạt động"], ["false", "Ngừng"]], String(user.active !== false))}
    ${!isEdit ? `<div class="field full"><label>Tạo nhiều tài khoản cùng lúc</label><textarea name="bulkAccounts" placeholder="Mỗi dòng: Tên nhân viên, email, mật khẩu, vai trò\nVí dụ: Nguyễn A, a@cocobay.vn, 123456, receptionist"></textarea><span class="hint">Nếu nhập phần này, hệ thống sẽ tạo nhiều tài khoản. Vai trò hợp lệ: admin, manager, receptionist, technician.</span></div>` : ""}
    <div class="field full">
      <label>Quyền chi tiết</label>
      <div class="permission-grid">
        ${permissionCatalog.map(([key, label, desc]) => `<label class="permission-item"><input type="checkbox" name="permission" value="${key}" ${selected.has(key) || role === "admin" ? "checked" : ""} ${role === "admin" ? "disabled" : ""}><span><strong>${label}</strong><small>${desc}</small></span></label>`).join("")}
      </div>
      <span class="hint">Admin luôn có toàn quyền. Các vai trò khác có thể bật/tắt quyền theo nhu cầu thực tế.</span>
    </div>
  </div>`;
}

function returnModal(r) {
  const db = getDb();
  const bike = db.motorbikes.find((item) => item.id === r.bikeId);
  const defaultKm = r.kmIn || bike?.odometer || r.kmOut || 0;
  return `<div class="modal-backdrop"><form class="modal" id="return-form" data-id="${r.id}">
    <header><h3>Trả xe ${r.code}</h3><button class="ghost" data-action="close-modal" type="button">Đóng</button></header>
    <div class="modal-body form-grid">
      ${field("kmIn", "Kilomet lúc trả", defaultKm, true, "number")}
      <div class="field full"><label>Ảnh sau khi nhận</label><input name="afterPhoto" type="file" accept="image/*" capture="environment"><div class="photo-preview" id="photo-preview">${r.afterPhoto ? `<img src="${r.afterPhoto}" alt="Ảnh trả xe">` : "Chọn ảnh để xem trước"}</div></div>
      <p class="hint full">Hệ thống tự ghi nhận đã thanh toán đủ ${money(r.total || 0)}, xe bình thường và chuyển xe về trạng thái có sẵn.</p>
    </div>
    <footer><button class="ghost" data-action="close-modal" type="button">Hủy</button><button class="primary" type="submit">Hoàn tất trả xe</button></footer>
  </form></div>`;
}

function bikeKmModal(b) {
  return `<div class="modal-backdrop"><form class="modal" id="bike-km-form" data-id="${b.id}">
    <header><h3>Cập nhật km và thay nhớt ${b.code}</h3><button class="ghost" data-action="close-modal" type="button">Đóng</button></header>
    <div class="modal-body form-grid">
      ${field("odometer", "Km hiện tại", b.odometer || 0, true, "number")}
      ${field("lastOilChangeDate", "Ngày thay nhớt gần nhất", b.lastOilChangeDate || todayISO(), false, "date")}
      ${field("lastOilChangeKm", "Km lần thay nhớt gần nhất", b.lastOilChangeKm || 0, false, "number")}
      ${field("oilChangeIntervalKm", "Chu kỳ thay nhớt (km)", b.oilChangeIntervalKm || 1500, false, "number")}
      ${field("lastMaintenanceKm", "Km lần bảo trì gần nhất", b.lastMaintenanceKm || 0, false, "number")}
      ${field("maintenanceIntervalKm", "Chu kỳ bảo trì (km)", b.maintenanceIntervalKm || 3000, false, "number")}
      ${field("nextMaintenance", "Lịch bảo trì theo ngày", b.nextMaintenance || todayISO(30), false, "date")}
      <label class="permission-item full"><input name="markOilChanged" type="checkbox" value="yes"><span><strong>Vừa thay nhớt ở km hiện tại</strong><small>Tự đặt km lần thay nhớt gần nhất bằng km hiện tại.</small></span></label>
      <label class="permission-item full"><input name="markMaintained" type="checkbox" value="yes"><span><strong>Vừa bảo trì ở km hiện tại</strong><small>Tự đặt km lần bảo trì gần nhất bằng km hiện tại.</small></span></label>
    </div>
    <footer><button class="ghost" data-action="close-modal" type="button">Hủy</button><button class="primary" type="submit">Lưu cập nhật</button></footer>
  </form></div>`;
}

function detailBikeModal(b) {
  const db = getDb();
  const rentals = db.rentals.filter((r) => r.bikeId === b.id);
  const tickets = db.tickets.filter((t) => t.assetType === "Xe máy" && t.assetId === b.id)
    .sort((a, b) => new Date(b.foundDate || b.createdAt || b.dueDate || 0) - new Date(a.foundDate || a.createdAt || a.dueDate || 0));
  const owner = db.owners.find((o) => o.id === b.ownerId);
  const revenue = rentals.reduce((s, r) => s + Number(r.paid || 0), 0);
  const costs = tickets.reduce((s, t) => s + ticketCost(t), 0);
  const completedCost = tickets.filter((t) => t.status === "Hoàn thành").reduce((s, t) => s + ticketCost(t), 0);
  const pendingCost = costs - completedCost;
  return `<div class="modal-backdrop"><div class="modal">
    <header><h3>${b.code} · ${b.name}</h3><button class="ghost" data-action="close-modal">Đóng</button></header>
    <div class="modal-body grid">
      <div class="grid cols-3">${metric("Doanh thu", money(revenue))}${metric("Tổng chi phí sửa", money(costs))}${metric("Số phiếu sửa", tickets.length)}</div>
      <div class="grid cols-3">${metric("Đã hoàn thành", money(completedCost))}${metric("Đang xử lý/dự kiến", money(pendingCost))}${metric("Lần sửa gần nhất", latestBikeTicket(tickets) ? formatDate(latestBikeTicket(tickets).foundDate || latestBikeTicket(tickets).dueDate) : "-")}</div>
      <div class="card"><h3>Thông tin xe</h3><p>${b.plate} · ${b.brand} ${b.model} · ${b.color}</p><p>Chủ xe: ${owner?.name || "-"} · ${b.ownership}</p><p>Km: ${Number(b.odometer).toLocaleString("vi-VN")} · Xăng: ${b.fuel} · ${pill(b.status)}</p></div>
      <div class="grid cols-2">
        <div class="card"><h3>Nhắc thay nhớt/bảo trì theo km</h3>
          <p><strong>Thay nhớt:</strong> ${oilHint(b)}<br><span class="hint">Ngày thay ${formatDate(b.lastOilChangeDate)} · Lần gần nhất ${Number(b.lastOilChangeKm || 0).toLocaleString("vi-VN")} km · Chu kỳ ${Number(b.oilChangeIntervalKm || 0).toLocaleString("vi-VN")} km</span></p>
          <p><strong>Bảo trì:</strong> ${maintenanceKmHint(b)}<br><span class="hint">Lần gần nhất ${Number(b.lastMaintenanceKm || 0).toLocaleString("vi-VN")} km · Chu kỳ ${Number(b.maintenanceIntervalKm || 0).toLocaleString("vi-VN")} km</span></p>
        </div>
        <div class="card"><h3>Hình ảnh xe và giấy tờ</h3>
          <div class="image-grid">${(b.images || []).map((src, index) => `<img src="${src}" alt="Hình xe ${index + 1}">`).join("") || `<span>Chưa có hình ảnh đính kèm.</span>`}</div>
        </div>
      </div>
      <div class="grid cols-2"><div class="card"><h3>Lịch sử thuê</h3>${rentals.map(calendarItem).join("") || "<div class='empty'>Chưa có.</div>"}</div>${bikeRepairHistoryCard(tickets)}</div>
    </div>
  </div></div>`;
}

function bikeRepairHistoryCard(tickets) {
  return `<div class="card bike-repair-history">
    <div class="panel-title">
      <div><h3>Lịch sử chi phí sửa xe</h3><span class="hint">Theo dõi từng phiếu, ngày tạo và số tiền đã/dự kiến sửa.</span></div>
      <span class="pill">${tickets.length} phiếu</span>
    </div>
    <div class="table-wrap compact-table"><table>
      <thead><tr><th>Mã phiếu</th><th>Ngày</th><th>Lỗi</th><th>Chi phí dự kiến</th><th>Chi phí thực tế</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
      <tbody>${tickets.map((t) => `<tr>
        <td><strong>${t.code}</strong><br><span class="hint">${t.priority || ""}</span></td>
        <td>${formatDate(t.foundDate || t.dueDate)}</td>
        <td>${t.issue || "-"}</td>
        <td>${money(t.estimatedCost || 0)}</td>
        <td><strong>${money(t.actualCost || 0)}</strong></td>
        <td>${pill(t.status)}</td>
        <td><button class="ghost" data-modal="ticketEdit:${t.id}">Cập nhật</button></td>
      </tr>`).join("") || `<tr><td colspan="7" class="empty">Xe này chưa có lịch sử sửa chữa.</td></tr>`}</tbody>
      <tfoot><tr><th colspan="3">Tổng chi phí</th><th>${money(tickets.reduce((sum, t) => sum + Number(t.estimatedCost || 0), 0))}</th><th>${money(tickets.reduce((sum, t) => sum + Number(t.actualCost || 0), 0))}</th><th colspan="2">${money(tickets.reduce((sum, t) => sum + ticketCost(t), 0))}</th></tr></tfoot>
    </table></div>
  </div>`;
}

function field(name, label, value = "", required = false, type = "text") {
  return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${value ?? ""}" ${required ? "required" : ""}></div>`;
}

function timeParts(value = "08:00") {
  const [rawHour = "08", rawMinute = "00"] = String(value || "08:00").split(":");
  const hour = Math.min(23, Math.max(0, Number(rawHour) || 0));
  const minute = Math.min(55, Math.max(0, Math.round((Number(rawMinute) || 0) / 5) * 5));
  return {
    hour: String(hour).padStart(2, "0"),
    minute: String(minute).padStart(2, "0")
  };
}

function composeTime(hour, minute) {
  return `${String(hour || "00").padStart(2, "0")}:${String(minute || "00").padStart(2, "0")}`;
}

function timePickerField(name, label, value = "08:00") {
  const parts = timeParts(value);
  const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
  const minutes = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
  return `<div class="field time-picker-field">
    <label>${label}</label>
    <div class="time-picker" role="group" aria-label="${label}">
      <select name="${name}Hour" aria-label="${label} giờ" required>${hours.map((hour) => `<option value="${hour}" ${parts.hour === hour ? "selected" : ""}>${hour}</option>`).join("")}</select>
      <span>:</span>
      <select name="${name}Minute" aria-label="${label} phút" required>${minutes.map((minute) => `<option value="${minute}" ${parts.minute === minute ? "selected" : ""}>${minute}</option>`).join("")}</select>
    </div>
    <span class="hint">Chọn theo định dạng 24 giờ, ví dụ 13:00 là 1 giờ chiều.</span>
  </div>`;
}

function selectField(name, label, options, value = "", required = false) {
  return `<div class="field"><label>${label}</label><select name="${name}" ${required ? "required" : ""}>${options.map((option) => {
    const val = Array.isArray(option) ? option[0] : option;
    const text = Array.isArray(option) ? option[1] : option;
    return `<option value="${val}" ${String(value) === String(val) ? "selected" : ""}>${text}</option>`;
  }).join("")}</select></div>`;
}

function bindApp() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
    state.view = button.dataset.view;
    state.mobileNav = false;
    state.query = "";
    state.filter = "all";
    render();
  }));
  document.querySelectorAll("[data-modal]").forEach((button) => button.addEventListener("click", () => {
    state.modal = button.dataset.modal;
    render();
  }));
  document.querySelectorAll("[data-action]").forEach((button) => {
    if (button.dataset.action?.startsWith("remove-bike-image:")) return;
    button.addEventListener("click", handleAction);
  });
  document.querySelectorAll(".multi-bike-option input[name='bikeIds']").forEach((input) => input.addEventListener("change", (event) => {
    event.currentTarget.closest(".multi-bike-option")?.classList.toggle("selected", event.currentTarget.checked);
  }));
  document.querySelectorAll("[data-bike-status]").forEach((select) => select.addEventListener("change", (event) => {
    setBikeStatus(event.target.dataset.bikeStatus, event.target.value);
  }));
  document.querySelectorAll("[data-report-month]").forEach((input) => input.addEventListener("change", (event) => {
    state.reportMonth = event.target.value || todayISO().slice(0, 7);
    render();
  }));
  document.querySelectorAll("[data-booking-hotel]").forEach((input) => input.addEventListener("change", (event) => {
    bookingFilterState().hotel = event.target.value || "all";
    render();
  }));
  document.querySelectorAll("[data-booking-month]").forEach((input) => input.addEventListener("change", (event) => {
    const filters = bookingFilterState();
    filters.month = event.target.value || todayISO().slice(0, 7);
    if (!String(filters.date || "").startsWith(filters.month)) filters.date = `${filters.month}-01`;
    render();
  }));
  document.querySelectorAll("[data-booking-date]").forEach((input) => input.addEventListener("change", (event) => {
    const filters = bookingFilterState();
    filters.date = event.target.value || todayISO();
    filters.month = filters.date.slice(0, 7);
    render();
  }));
  document.querySelectorAll("[data-booking-period]").forEach((button) => button.addEventListener("click", (event) => {
    bookingFilterState().period = event.currentTarget.dataset.bookingPeriod || "month";
    render();
  }));
  document.querySelectorAll("[data-bike-filter]").forEach((input) => input.addEventListener("change", (event) => {
    state.bikeFilters[event.target.dataset.bikeFilter] = event.target.value;
    render();
  }));
  document.querySelectorAll("[data-bike-sort]").forEach((input) => input.addEventListener("change", (event) => {
    state.bikeFilters.sort = event.target.value;
    render();
  }));
  document.querySelectorAll("[data-bike-filter-owner]").forEach((button) => button.addEventListener("click", (event) => {
    const ownerId = event.currentTarget.dataset.bikeFilterOwner;
    state.bikeFilters.owner = ownerId === "missing" ? "missing" : ownerId;
    render();
  }));
  document.querySelectorAll("[data-rental-date]").forEach((input) => input.addEventListener("change", (event) => {
    state.rentalDate = event.target.value;
    render();
  }));
  document.querySelectorAll("[data-filter]").forEach((input) => {
    const updateFilter = (event) => {
      if (event.target.dataset.filter === "query") state.query = event.target.value;
      if (event.target.dataset.filter === "status") state.filter = event.target.value;
      render();
    };
    input.addEventListener(input.tagName === "SELECT" ? "change" : "input", updateFilter);
  });
  document.querySelectorAll("[data-attendance-filter]").forEach((input) => input.addEventListener("input", (event) => {
    state.attendance[event.target.dataset.attendanceFilter] = event.target.value;
    render();
  }));
  document.querySelectorAll("[data-audit-filter]").forEach((input) => input.addEventListener("input", (event) => {
    state.auditFilters[event.target.dataset.auditFilter] = event.target.value;
    render();
  }));
  document.getElementById("modal-form")?.addEventListener("submit", saveModal);
  document.getElementById("return-form")?.addEventListener("submit", saveReturn);
  document.getElementById("bike-km-form")?.addEventListener("submit", saveBikeKm);
  document.getElementById("bike-image-preview")?.addEventListener("click", handleBikeImagePreviewClick);
  document.querySelector("input[name='afterPhoto']")?.addEventListener("change", previewPhoto);
  document.querySelector("input[name='bikeImages']")?.addEventListener("change", previewBikeImages);
  document.querySelector("input[name='employeePhoto']")?.addEventListener("change", previewEmployeePhoto);
  document.querySelector("input[name='applicantPhoto']")?.addEventListener("change", previewApplicantPhoto);
  document.querySelector("[data-import-json]")?.addEventListener("change", importJsonToMysql);
}

function handleBikeImagePreviewClick(event) {
  const button = event.target.closest("[data-action^='remove-bike-image:']");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  handleAction({ currentTarget: button });
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  if (action === "toggle-nav") {
    state.mobileNav = !state.mobileNav;
    render();
  }
  if (action === "logout") {
    if (apiState.enabled) apiRequest("/logout", { method: "POST" }).catch(() => {});
    state.user = null;
    localStorage.removeItem(SESSION_KEY);
    render();
  }
  if (action === "close-modal") {
    state.modal = null;
    state.bikeImageDraft = null;
    render();
  }
  if (action?.startsWith("remove-bike-image:")) {
    const index = Number(action.split(":")[1]);
    if (state.bikeImageDraft?.images) {
      const [removed] = state.bikeImageDraft.images.splice(index, 1);
      if (removed && String(removed).startsWith("/uploads/")) {
        state.bikeImageDraft.deletedImages = [...(state.bikeImageDraft.deletedImages || []), removed];
      }
      const preview = document.getElementById("bike-image-preview");
      if (preview) preview.innerHTML = renderEditableBikeImages(state.bikeImageDraft.images);
      const input = document.querySelector("input[name='bikeImages']");
      if (input) input.value = "";
    }
  }
  if (action?.startsWith("panel-page:")) {
    const [, key, page] = action.split(":");
    state.panelPages = state.panelPages || {};
    state.panelPages[key] = Math.max(1, Number(page || 1));
    render();
  }
  if (action?.startsWith("set-bike-status:")) {
    const parts = action.split(":");
    setBikeStatus(parts[1], parts.slice(2).join(":"));
  }
  if (action?.startsWith("delete-bike:")) deleteBike(action.split(":")[1]);
  if (action?.startsWith("toggle-oil-alert:")) toggleOilAlert(action.split(":")[1]);
  if (action?.startsWith("mark-oil-changed:")) markOilChanged(action.split(":")[1]);
  if (action?.startsWith("toggle-equipment-alert:")) toggleEquipmentAlert(action.split(":")[1]);
  if (action?.startsWith("mark-equipment-maintained:")) markEquipmentMaintained(action.split(":")[1]);
  if (action?.startsWith("handover:")) handoverRental(action.split(":")[1]);
  if (action?.startsWith("cancel-rental:")) cancelRental(action.split(":")[1]);
  if (action?.startsWith("delete-booking:")) deleteBooking(action.split(":")[1]);
  if (action?.startsWith("toggle-owner:")) toggleOwnerVisibility(action.split(":")[1]);
  if (action?.startsWith("delete-owner:")) deleteOwner(action.split(":")[1]);
  if (action?.startsWith("toggle-room:")) toggleRoomVisibility(action.split(":")[1]);
  if (action?.startsWith("delete-room:")) deleteRoom(action.split(":")[1]);
  if (action?.startsWith("approve:")) approveTicket(action.split(":")[1]);
  if (action === "mark-read") markRead();
  if (action === "backup-json") backupJson();
  if (action === "backup-website") backupWebsite();
  if (action === "reset-bike-filters") {
    state.query = "";
    state.filter = "all";
    state.bikeFilters = { owner: "all", type: "all", sort: "code-asc" };
    render();
  }
  if (action === "reset-audit-filters") {
    state.auditFilters = { query: "", user: "all", role: "all", action: "all", date: "" };
    render();
  }
  if (action === "export-bikes-excel") exportBikesExcel();
  if (action === "export-rentals-excel") exportRentalsExcel();
  if (action === "export-report") exportCsv();
  if (action === "print-report") printReportPdf();
  if (action === "export-attendance-xls") exportAttendanceExcel();
  if (action === "print-attendance-pdf") printAttendancePdf();
  if (action === "print") window.print();
}


function deleteBooking(id) {
  if (!can("booking_edit")) {
    showToast("T\u00e0i kho\u1ea3n n\u00e0y kh\u00f4ng c\u00f3 quy\u1ec1n x\u00f3a/s\u1eeda \u0111\u1eb7t ph\u00f2ng.");
    return;
  }
  const selected = bookingSeedData().bookings.find((item) => item.id === id);
  if (!selected) {
    showToast("Kh\u00f4ng t\u00ecm th\u1ea5y \u0111\u1eb7t ph\u00f2ng c\u1ea7n x\u00f3a.");
    return;
  }
  const useRemoteDelete = apiState.enabled && Boolean(state.user);
  mutateDb((db) => {
    const booking = (db.hotelBookings || []).find((item) => item.id === id);
    db.hotelBookings = (db.hotelBookings || []).filter((item) => item.id !== id);
    db.settings = db.settings || {};
    db.settings.deletedSeedBookings = Array.isArray(db.settings.deletedSeedBookings) ? db.settings.deletedSeedBookings : [];
    if (!booking && !db.settings.deletedSeedBookings.includes(id)) {
      db.settings.deletedSeedBookings.push(id);
    }
    state.modal = null;
    return { record: booking?.group || selected.group || id };
  }, "X\u00f3a \u0111\u1eb7t ph\u00f2ng", { skipRemote: useRemoteDelete });
  if (useRemoteDelete) syncDeletedBooking(id);
  else showToast("\u0110\u00e3 x\u00f3a \u0111\u1eb7t ph\u00f2ng.");
}

function deleteBike(id) {
  if (!isSuperAdmin()) {
    showToast("Ch\u1ec9 t\u00e0i kho\u1ea3n qu\u1ea3n tr\u1ecb cao nh\u1ea5t m\u1edbi c\u00f3 quy\u1ec1n x\u00f3a xe.");
    return;
  }
  const db = getDb();
  const bike = db.motorbikes.find((item) => item.id === id);
  if (!bike) {
    showToast("Kh\u00f4ng t\u00ecm th\u1ea5y xe c\u1ea7n x\u00f3a.");
    return;
  }
  const linkedRentals = db.rentals.filter((rental) => rental.bikeId === id).length;
  const linkedTickets = db.tickets.filter((ticket) => ticket.assetType === "Xe m\u00e1y" && ticket.assetId === id).length;
  const bikeImagesToDelete = Array.isArray(bike.images) ? bike.images.filter((src) => String(src || "").startsWith("/uploads/")) : [];
  const detail = `${bike.code} - ${bike.name} (${bike.plate || "kh\u00f4ng c\u00f3 bi\u1ec3n s\u1ed1"})`;
  const message = `X\u00f3a xe ${detail}?\n\nH\u1ec7 th\u1ed1ng s\u1ebd x\u00f3a k\u00e8m ${linkedRentals} phi\u1ebfu thu\u00ea v\u00e0 ${linkedTickets} phi\u1ebfu s\u1eeda/b\u1ea3o tr\u00ec li\u00ean quan.`;
  if (!confirm(message)) return;
  mutateDb((draft) => {
    draft.motorbikes = draft.motorbikes.filter((item) => item.id !== id);
    draft.rentals = draft.rentals.filter((rental) => rental.bikeId !== id);
    draft.tickets = draft.tickets.filter((ticket) => !(ticket.assetType === "Xe m\u00e1y" && ticket.assetId === id));
    draft.notifications = draft.notifications.filter((notification) => !String(notification.title || "").includes(bike.code));
    state.modal = null;
    return {
      record: detail,
      before: `Xe: ${detail}; phi\u1ebfu thu\u00ea: ${linkedRentals}; phi\u1ebfu s\u1eeda: ${linkedTickets}`,
      after: "\u0110\u00e3 x\u00f3a"
    };
  }, "X\u00f3a xe m\u00e1y");
  if (bikeImagesToDelete.length) deleteUploadedImages(bikeImagesToDelete);
  showToast("\u0110\u00e3 x\u00f3a xe v\u00e0 d\u1eef li\u1ec7u li\u00ean quan.");
}

async function saveModal(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.dataset.form;
  const id = form.dataset.id;
  const extra = form.dataset.extra;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  if (type === "booking" && ((id && !can("booking_edit")) || (!id && !can("booking_write")))) {
    showToast("T\u00e0i kho\u1ea3n n\u00e0y kh\u00f4ng c\u00f3 quy\u1ec1n ghi/s\u1eeda l\u1ecbch \u0111\u1eb7t ph\u00f2ng.");
    return;
  }
  if (type === "bike") {
    data.images = state.bikeImageDraft?.images || await readBikeImages(form, id);
    data.images = await normalizeBikeImages(data.images);
    delete data.bikeImages;
  }
  if (type === "hrEmployee") {
    data.photo = await readEmployeePhoto(form, id);
    delete data.employeePhoto;
  }
  if (type === "applicant") {
    data.photo = await readApplicantPhoto(form, id);
    delete data.applicantPhoto;
  }
  if (type === "user") {
    data.permissions = Array.from(form.querySelectorAll("input[name='permission']:checked")).map((input) => input.value);
    data.active = data.active === "true";
  }
  if (type === "attendanceShift") {
    data.start = composeTime(data.startHour, data.startMinute);
    data.end = composeTime(data.endHour, data.endMinute);
    delete data.startHour;
    delete data.startMinute;
    delete data.endHour;
    delete data.endMinute;
  }
  if (type === "rental" && !id) {
    data.bikeIds = formData.getAll("bikeIds").filter(Boolean);
    if (!data.bikeIds.length) {
      showToast("Hãy chọn ít nhất 1 xe để tạo phiếu thuê.");
      return;
    }
    data.bikeId = data.bikeIds[0];
  }
  if (type === "booking" && bookingHasConflict(getDb(), data, id)) {
    showToast("Ph\u00f2ng n\u00e0y \u0111\u00e3 c\u00f3 kh\u00e1ch trong kho\u1ea3ng th\u1eddi gian \u0111\u00e3 ch\u1ecdn.");
    return;
  }
  if (type === "rental" && rentalConflictBikes(data, id).length) {
    const conflicts = rentalConflictBikes(data, id);
    showToast(`Không thể đặt trùng lịch: ${conflicts.map((bike) => bike.code).join(", ")}.`);
    return;
  }
  const deletedBikeImages = type === "bike" ? [...(state.bikeImageDraft?.deletedImages || [])] : [];
  mutateDb((db) => {
    let savedTicket = null;
    if (type === "hotel") upsertHotel(db, data, id);
    if (type === "room") upsertRoom(db, data, id);
    if (type === "bike") upsertBike(db, data, id);
    if (type === "bikeType") upsertBikeType(db, data, id);
    if (type === "rental") upsertRental(db, data, id);
    if (type === "booking") upsertBooking(db, data, id);
    if (type === "ticket" || type === "ticketEdit") savedTicket = upsertTicket(db, data, type === "ticketEdit" ? id : "", extra);
    if (type === "equipment") upsertEquipment(db, data, id);
    if (type === "equipmentType") upsertEquipmentType(db, data, id);
    if (type === "owner") upsertOwner(db, data, id);
    if (type === "hrEmployee") upsertHrEmployee(db, data, id);
    if (type === "applicant") upsertApplicant(db, data, id);
    if (type === "attendanceRecord") upsertAttendanceRecord(db, data, id);
    if (type === "attendanceShift") upsertAttendanceShift(db, data, id);
    if (type === "user") upsertUser(db, data, id);
    state.modal = null;
    state.bikeImageDraft = null;
    return { record: savedTicket?.code || id || data.code || data.name };
  }, `Lưu ${type}`);
  if (type === "ticket") showToast("Đã tạo phiếu sửa/bảo trì và gửi thông báo.");
  else if (type === "ticketEdit") showToast("Đã cập nhật phiếu sửa/bảo trì.");
  else showToast("Đã lưu dữ liệu.");
  if (deletedBikeImages.length) {
    deleteUploadedImages(deletedBikeImages);
  }
}

function upsertBike(db, data, id) {
  if (db.motorbikes.some((b) => b.id !== id && (b.code === data.code || b.plate === data.plate))) {
    showToast("Mã xe hoặc biển số đã tồn tại.");
    throw new Error("Duplicate bike");
  }
  const existing = db.motorbikes.find((b) => b.id === id);
  const payload = {
    ...data,
    weekdayPrice: +data.weekdayPrice,
    weekendPrice: +data.weekendPrice,
    holidayPrice: +data.holidayPrice,
    odometer: +data.odometer,
    lastOilChangeKm: +data.lastOilChangeKm,
    lastOilChangeDate: data.lastOilChangeDate || existing?.lastOilChangeDate || todayISO(),
    oilChangeIntervalKm: +data.oilChangeIntervalKm,
    lastMaintenanceKm: +data.lastMaintenanceKm,
    maintenanceIntervalKm: +data.maintenanceIntervalKm,
    images: data.images || existing?.images || []
  };
  if (id) Object.assign(db.motorbikes.find((b) => b.id === id), payload);
  else db.motorbikes.push({ id: uid("B"), ...payload });
}

function upsertBikeType(db, data, id) {
  if (db.bikeTypes.some((type) => type.id !== id && type.name.toLowerCase() === data.name.toLowerCase())) {
    showToast("Tên loại xe đã tồn tại.");
    throw new Error("Duplicate bike type");
  }
  const payload = {
    ...data,
    oilChangeIntervalKm: +data.oilChangeIntervalKm,
    maintenanceIntervalKm: +data.maintenanceIntervalKm
  };
  if (id) Object.assign(db.bikeTypes.find((type) => type.id === id), payload);
  else db.bikeTypes.push({ id: uid("BT"), ...payload });
}

function upsertRental(db, data, id) {
  const bikeIds = id ? [data.bikeId] : (data.bikeIds?.length ? data.bikeIds : [data.bikeId]);
  const count = Math.max(1, bikeIds.length);
  bikeIds.forEach((bikeId, index) => {
    const payload = rentalPayloadForBike(data, bikeId, count, index);
    if (id) Object.assign(db.rentals.find((r) => r.id === id), payload);
    else db.rentals.push({ id: uid("R"), code: uid("RT"), ...payload });
    const bike = db.motorbikes.find((b) => b.id === bikeId);
    if (bike && ["Đã đặt", "Đang thuê"].includes(payload.status)) bike.status = payload.status;
  });
}

function rentalPayloadForBike(data, bikeId, count, index) {
  const days = Math.max(1, Math.ceil((new Date(data.end) - new Date(data.start)) / 86400000));
  const surcharge = splitAmount(data.surcharge, count, index);
  const discount = splitAmount(data.discount, count, index);
  const deposit = splitAmount(data.deposit, count, index);
  const paid = splitAmount(data.paid, count, index);
  const total = days * Number(data.price) + surcharge - discount;
  const groupNote = count > 1 ? `Tạo nhanh theo đoàn ${count} xe.` : "";
  const notes = [data.notes || "", groupNote].filter(Boolean).join("\n");
  const { bikeIds, ...rest } = data;
  return {
    ...rest,
    bikeId,
    price: +data.price,
    surcharge,
    discount,
    deposit,
    paid,
    total,
    kmOut: "",
    fuelOut: "",
    kmIn: "",
    fuelIn: "",
    beforePhoto: "",
    afterPhoto: "",
    notes
  };
}

function splitAmount(value, count, index) {
  const total = Number(value || 0);
  if (count <= 1) return total;
  const base = Math.floor(total / count);
  return index === count - 1 ? total - base * (count - 1) : base;
}

function upsertTicket(db, data, id) {
  const existing = db.tickets.find((t) => t.id === id);
  const payload = {
    ...data,
    estimatedCost: +data.estimatedCost,
    actualCost: +data.actualCost,
    reporterId: state.user.id,
    beforePhoto: existing?.beforePhoto || "",
    afterPhoto: existing?.afterPhoto || "",
    approverId: existing?.approverId || "",
    createdAt: existing?.createdAt || nowLocal()
  };
  let ticket;
  if (id) {
    ticket = db.tickets.find((t) => t.id === id);
    Object.assign(ticket, payload);
  } else {
    ticket = { id: uid("T"), code: uid("MT"), ...payload };
    db.tickets.push(ticket);
    addTicketNotification(db, ticket);
  }
  if (data.assetType === "Xe máy") {
    const bike = db.motorbikes.find((b) => b.id === data.assetId);
    if (bike && !["Hoàn thành", "Đã hủy"].includes(data.status)) bike.status = data.status === "Chờ phụ tùng" ? "Chờ phụ tùng" : "Đang sửa";
  } else {
    const equipment = db.equipment.find((e) => e.id === data.assetId);
    if (equipment && !["Hoàn thành", "Đã hủy"].includes(data.status)) equipment.condition = "Đang sửa";
  }
  return ticket;
}

function addTicketNotification(db, ticket) {
  const isBike = ticket.assetType === "Xe máy";
  const asset = isBike
    ? db.motorbikes.find((bike) => bike.id === ticket.assetId)
    : db.equipment.find((item) => item.id === ticket.assetId);
  const title = isBike ? `Phiếu sửa xe mới: ${ticket.code}` : `Phiếu sửa thiết bị mới: ${ticket.code}`;
  const assetText = asset ? `${asset.code || ""} · ${asset.name || ""}` : ticket.assetType;
  db.notifications.unshift({
    id: uid("N"),
    title,
    message: `${assetText} - ${ticket.issue || "Có phiếu sửa mới"} - hạn ${formatDate(ticket.dueDate)}`,
    type: isBike ? "Sửa xe" : "Sửa thiết bị",
    read: false,
    createdAt: ticket.createdAt || nowLocal(),
    refId: ticket.id
  });
}

function upsertEquipment(db, data, id) {
  const typeConfig = db.equipmentTypes.find((type) => type.name === data.type);
  const existing = db.equipment.find((e) => e.id === id);
  const payload = {
    ...data,
    typeId: typeConfig?.id || "",
    price: +data.price,
    failureCount: existing?.failureCount || 0,
    repairCost: existing?.repairCost || 0,
    photos: existing?.photos || [],
    lastMaintenance: existing?.lastMaintenance || todayISO(),
    maintenanceAlertEnabled: existing?.maintenanceAlertEnabled ?? true,
    maintenanceAlertHandled: false,
    extra: data.power
  };
  if (id) Object.assign(db.equipment.find((e) => e.id === id), payload);
  else db.equipment.push({ id: uid("E"), ...payload });
}

function upsertEquipmentType(db, data, id) {
  if (db.equipmentTypes.some((type) => type.id !== id && type.name.toLowerCase() === data.name.toLowerCase())) {
    showToast("Tên loại thiết bị đã tồn tại.");
    throw new Error("Duplicate equipment type");
  }
  const payload = {
    ...data,
    maintenanceIntervalDays: +data.maintenanceIntervalDays,
    warrantyAlertDays: +data.warrantyAlertDays
  };
  if (id) Object.assign(db.equipmentTypes.find((type) => type.id === id), payload);
  else db.equipmentTypes.push({ id: uid("ET"), ...payload });
}

function upsertHrEmployee(db, data, id) {
  if (db.hrEmployees.some((item) => item.id !== id && item.code.toLowerCase() === data.code.toLowerCase())) {
    showToast("Mã nhân sự đã tồn tại.");
    throw new Error("Duplicate HR employee");
  }
  const payload = {
    ...data,
    salary: +data.salary || 0
  };
  if (id) Object.assign(db.hrEmployees.find((item) => item.id === id), payload);
  else db.hrEmployees.push({ id: uid("HR"), ...payload });
}

function upsertApplicant(db, data, id) {
  if (db.jobApplicants.some((item) => item.id !== id && item.code.toLowerCase() === data.code.toLowerCase())) {
    showToast("Mã ứng viên đã tồn tại.");
    throw new Error("Duplicate applicant");
  }
  const payload = {
    ...data,
    expectedSalary: +data.expectedSalary || 0
  };
  if (id) Object.assign(db.jobApplicants.find((item) => item.id === id), payload);
  else db.jobApplicants.push({ id: uid("CV"), ...payload });
}

function upsertAttendanceRecord(db, data, id) {
  if (db.attendanceRecords.some((item) => item.id !== id && item.employeeId === data.employeeId && item.date === data.date && item.shiftId === data.shiftId)) {
    showToast("Nhân viên đã có dòng chấm công cho ngày và ca này.");
    throw new Error("Duplicate attendance");
  }
  const payload = { ...data };
  if (id) Object.assign(db.attendanceRecords.find((item) => item.id === id), payload);
  else db.attendanceRecords.push({ id: uid("ATT"), ...payload });
}

function upsertAttendanceShift(db, data, id) {
  if (db.attendanceShifts.some((item) => item.id !== id && item.name.toLowerCase() === data.name.toLowerCase())) {
    showToast("Tên ca làm đã tồn tại.");
    throw new Error("Duplicate attendance shift");
  }
  const payload = { ...data, breakMinutes: +data.breakMinutes || 0 };
  if (id) Object.assign(db.attendanceShifts.find((item) => item.id === id), payload);
  else db.attendanceShifts.push({ id: uid("SHIFT"), ...payload });
}

function upsertUser(db, data, id) {
  if (data.bulkAccounts?.trim() && !id) {
    const created = [];
    const lines = data.bulkAccounts.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    lines.forEach((line) => {
      const [name, email, password = "123456", role = "receptionist"] = line.split(",").map((part) => part.trim());
      if (!name || !email) return;
      if (db.users.some((user) => user.email.toLowerCase() === email.toLowerCase()) || created.some((user) => user.email.toLowerCase() === email.toLowerCase())) return;
      const safeRole = roles[role] ? role : "receptionist";
      created.push({
        id: uid("U"),
        name,
        email,
        password,
        role: safeRole,
        permissions: [...(permissions[safeRole] || [])],
        active: true,
        lastLoginAt: ""
      });
    });
    db.users.push(...created);
    if (!created.length) showToast("Không có tài khoản hợp lệ để tạo hoặc email đã trùng.");
    return;
  }

  if (db.users.some((user) => user.id !== id && user.email.toLowerCase() === data.email.toLowerCase())) {
    showToast("Email nhân viên đã tồn tại.");
    throw new Error("Duplicate user email");
  }

  const payload = {
    name: data.name,
    email: data.email,
    password: data.password || "123456",
    role: data.role,
    permissions: data.role === "admin" ? [...permissions.admin] : data.permissions,
    active: Boolean(data.active)
  };

  if (id) {
    const existing = db.users.find((user) => user.id === id);
    Object.assign(existing, payload);
    if (state.user?.id === id) {
      state.user = { ...existing };
      localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: existing.id }));
    }
  } else {
    db.users.push({ id: uid("U"), ...payload, lastLoginAt: "" });
  }
}

function hasRentalConflict(bikeId, start, end, ignoreId = "") {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  return getDb().rentals.some((r) => r.id !== ignoreId && r.bikeId === bikeId && !["Đã trả", "Đã hủy"].includes(r.status) && startTime < new Date(r.end).getTime() && endTime > new Date(r.start).getTime());
}

function rentalConflictBikes(data, ignoreId = "") {
  const db = getDb();
  const bikeIds = data.bikeIds?.length ? data.bikeIds : [data.bikeId];
  return bikeIds
    .filter((bikeId) => hasRentalConflict(bikeId, data.start, data.end, ignoreId))
    .map((bikeId) => db.motorbikes.find((bike) => bike.id === bikeId))
    .filter(Boolean);
}

function hasOpenRentalForBike(db, bikeId, ignoreId = "") {
  return db.rentals.some((rental) => rental.id !== ignoreId && rental.bikeId === bikeId && !["Đã trả", "Đã hủy"].includes(rental.status));
}

function releaseBikeIfNoOpenRental(db, rental) {
  const bike = db.motorbikes.find((item) => item.id === rental.bikeId);
  if (!bike || hasOpenRentalForBike(db, rental.bikeId, rental.id)) return;
  if (["Hư hỏng", "Đang sửa", "Chờ kiểm tra", "Chờ phụ tùng", "Ngừng sử dụng"].includes(bike.status)) return;
  bike.status = "Có sẵn";
}

function handoverRental(id) {
  mutateDb((db) => {
    const r = db.rentals.find((x) => x.id === id);
    const bike = db.motorbikes.find((b) => b.id === r.bikeId);
    r.status = "Đang thuê";
    r.kmOut = bike?.odometer || "";
    r.fuelOut = bike?.fuel || "";
    if (bike) bike.status = "Đang thuê";
    return { record: r.code };
  }, "Giao xe");
  showToast("Đã giao xe và chuyển trạng thái đang thuê.");
}

function cancelRental(id) {
  if (!can("manage")) {
    showToast("Chỉ admin hoặc quản lý có quyền hủy phiếu thuê.");
    return;
  }
  const rental = getDb().rentals.find((item) => item.id === id);
  if (!rental) {
    showToast("Không tìm thấy phiếu thuê cần hủy.");
    return;
  }
  if (["Đã trả", "Đã hủy"].includes(rental.status)) {
    showToast("Phiếu thuê này đã kết thúc, không cần hủy lại.");
    return;
  }
  const reason = prompt(`Lý do hủy phiếu ${rental.code}:`, rental.cancelReason || "Khách hủy giữa chừng");
  if (reason === null) return;
  if (!confirm(`Xác nhận hủy phiếu ${rental.code}?\nXe sẽ về "Có sẵn" nếu không còn phiếu thuê khác đang giữ xe.`)) return;
  mutateDb((db) => {
    const r = db.rentals.find((item) => item.id === id);
    if (!r) return { record: id, after: "Không tìm thấy" };
    const previousStatus = r.status;
    r.status = "Đã hủy";
    r.cancelReason = reason.trim() || "Khách hủy giữa chừng";
    r.cancelledAt = nowLocal();
    r.cancelledBy = state.user?.name || "Admin";
    r.notes = [r.notes || "", `Hủy: ${r.cancelReason}`].filter(Boolean).join("\n");
    releaseBikeIfNoOpenRental(db, r);
    state.modal = null;
    return {
      record: r.code,
      before: previousStatus,
      after: `Đã hủy - ${r.cancelReason}`
    };
  }, "Hủy phiếu thuê");
  showToast("Đã hủy phiếu thuê và cập nhật trạng thái xe.");
}

async function saveReturn(event) {
  event.preventDefault();
  const id = event.currentTarget.dataset.id;
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  const afterPhoto = await readReturnPhoto(form, id);
  mutateDb((db) => {
    const r = db.rentals.find((x) => x.id === id);
    const bike = db.motorbikes.find((b) => b.id === r.bikeId);
    Object.assign(r, {
      kmIn: data.kmIn,
      fuelIn: r.fuelOut || bike?.fuel || "",
      paid: Number(r.total || 0),
      afterPhoto,
      status: "Đã trả"
    });
    if (bike) {
      bike.odometer = +data.kmIn;
      bike.fuel = r.fuelOut || bike.fuel || "";
      bike.status = "Có sẵn";
    }
    state.modal = null;
    return { record: r.code };
  }, "Trả xe");
  showToast("Đã hoàn tất trả xe.");
}

async function readReturnPhoto(form, id) {
  const input = form.querySelector("input[name='afterPhoto']");
  const file = input?.files?.[0];
  if (!file) return getDb().rentals.find((item) => item.id === id)?.afterPhoto || "";
  return compressImageFile(file, 720, 0.5, 90000);
}

function saveBikeKm(event) {
  event.preventDefault();
  const id = event.currentTarget.dataset.id;
  const data = Object.fromEntries(new FormData(event.currentTarget));
  mutateDb((db) => {
    const bike = db.motorbikes.find((item) => item.id === id);
    if (!bike) return { record: id };
    const odometer = +data.odometer || 0;
    bike.odometer = odometer;
    bike.lastOilChangeKm = data.markOilChanged === "yes" ? odometer : +data.lastOilChangeKm || 0;
    bike.lastOilChangeDate = data.markOilChanged === "yes" ? (data.lastOilChangeDate || todayISO()) : (data.lastOilChangeDate || bike.lastOilChangeDate || todayISO());
    if (data.markOilChanged === "yes") {
      bike.oilAlertEnabled = true;
      bike.oilAlertHandled = true;
    }
    bike.oilChangeIntervalKm = +data.oilChangeIntervalKm || 0;
    bike.lastMaintenanceKm = data.markMaintained === "yes" ? odometer : +data.lastMaintenanceKm || 0;
    bike.maintenanceIntervalKm = +data.maintenanceIntervalKm || 0;
    bike.nextMaintenance = data.nextMaintenance || bike.nextMaintenance;
    state.modal = null;
    return {
      record: bike.code,
      after: `${bike.odometer} km · thay nhớt ${bike.lastOilChangeKm} km ngày ${bike.lastOilChangeDate} · bảo trì ${bike.lastMaintenanceKm} km`
    };
  }, "Cập nhật km, thay nhớt và bảo trì xe");
  showToast("Đã cập nhật km, mốc thay nhớt và bảo trì.");
}

function setBikeStatus(id, status) {
  if (!bikeStatuses.includes(status)) return;
  mutateDb((db) => {
    const bike = db.motorbikes.find((item) => item.id === id);
    if (!bike) return { record: id };
    const before = bike.status;
    bike.status = status;
    return { record: bike.code, before, after: status };
  }, "Cập nhật trạng thái xe");
  showToast(`Đã cập nhật trạng thái xe: ${status}.`);
}

function toggleOilAlert(id) {
  mutateDb((db) => {
    const bike = db.motorbikes.find((item) => item.id === id);
    if (!bike) return { record: id };
    bike.oilAlertEnabled = bike.oilAlertEnabled === false;
    if (bike.oilAlertEnabled) bike.oilAlertHandled = false;
    return { record: bike.code, after: bike.oilAlertEnabled ? "Bật cảnh báo thay nhớt" : "Tắt cảnh báo thay nhớt" };
  }, "Cập nhật cảnh báo thay nhớt");
  showToast("Đã cập nhật trạng thái cảnh báo thay nhớt.");
}

function markOilChanged(id) {
  mutateDb((db) => {
    const bike = db.motorbikes.find((item) => item.id === id);
    if (!bike) return { record: id };
    bike.lastOilChangeDate = todayISO();
    bike.lastOilChangeKm = Number(bike.odometer || bike.lastOilChangeKm || 0);
    bike.oilAlertHandled = true;
    bike.oilAlertEnabled = true;
    return { record: bike.code, after: `Đã thay nhớt ngày ${bike.lastOilChangeDate} tại ${bike.lastOilChangeKm} km` };
  }, "Đánh dấu xe đã thay nhớt");
  showToast("Đã cập nhật xe đã thay nhớt và tắt cảnh báo hiện tại.");
}

function toggleEquipmentAlert(id) {
  mutateDb((db) => {
    const item = db.equipment.find((equipment) => equipment.id === id);
    if (!item) return { record: id };
    item.maintenanceAlertEnabled = item.maintenanceAlertEnabled === false;
    if (item.maintenanceAlertEnabled) item.maintenanceAlertHandled = false;
    return { record: item.code, after: item.maintenanceAlertEnabled ? "Bật cảnh báo bảo trì thiết bị" : "Tắt cảnh báo bảo trì thiết bị" };
  }, "Cập nhật cảnh báo bảo trì thiết bị");
  showToast("Đã cập nhật trạng thái cảnh báo thiết bị.");
}

function markEquipmentMaintained(id) {
  mutateDb((db) => {
    const item = db.equipment.find((equipment) => equipment.id === id);
    if (!item) return { record: id };
    const typeConfig = db.equipmentTypes.find((type) => type.name === item.type);
    const interval = Number(typeConfig?.maintenanceIntervalDays || 90);
    item.lastMaintenance = todayISO();
    item.nextMaintenance = todayISO(interval);
    item.maintenanceAlertEnabled = true;
    item.maintenanceAlertHandled = true;
    if (item.condition === "Đang hư" || item.condition === "Đang sửa") item.condition = "Hoạt động";
    return { record: item.code, after: `Đã bảo trì ngày ${item.lastMaintenance}, lịch tiếp theo ${item.nextMaintenance}` };
  }, "Đánh dấu thiết bị đã bảo trì");
  showToast("Đã cập nhật thiết bị đã bảo trì và lịch tiếp theo.");
}

function approveTicket(id) {
  mutateDb((db) => {
    const t = db.tickets.find((x) => x.id === id);
    t.status = "Hoàn thành";
    t.approverId = state.user.id;
    if (t.assetType === "Xe máy") {
      const b = db.motorbikes.find((x) => x.id === t.assetId);
      if (b) {
        b.status = "Có sẵn";
        b.lastMaintenance = todayISO();
        b.nextMaintenance = todayISO(30);
      }
    } else {
      const e = db.equipment.find((x) => x.id === t.assetId);
      if (e) {
        e.condition = "Hoạt động";
        e.failureCount += 1;
        e.repairCost += Number(t.actualCost || t.estimatedCost || 0);
        e.lastMaintenance = todayISO();
        e.nextMaintenance = todayISO(90);
      }
    }
    return { record: t.code };
  }, "Nghiệm thu sửa chữa");
  showToast("Đã nghiệm thu và đưa tài sản về trạng thái hoạt động.");
}

function markRead() {
  mutateDb((db) => {
    db.notifications.forEach((n) => n.read = true);
    return { record: "notifications" };
  }, "Đánh dấu thông báo đã đọc");
}

function backupJson() {
  const payload = {
    app: "COCO BAY Internal Management",
    storageKey: DB_KEY,
    exportedAt: nowLocal(),
    data: getDb()
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  downloadBlob(blob, `coco-bay-backup-${todayISO()}.json`);
  showToast("Đã sao lưu dữ liệu JSON.");
}

async function importJsonToMysql(event) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const payload = JSON.parse(text);
    const importedDb = payload.data && typeof payload.data === "object" ? payload.data : payload;
    if (!isValidImportedDb(importedDb)) {
      showToast("File JSON không đúng định dạng database Coco Bay.");
      input.value = "";
      return;
    }
    migrateDb(importedDb);
    if (apiState.enabled && state.user) {
      const saved = await apiRequest("/data", { method: "PUT", body: JSON.stringify({ db: importedDb }) });
      if (Number.isInteger(Number(saved.version))) apiState.version = Number(saved.version);
      safeLocalSet(DB_KEY, JSON.stringify(importedDb), { silent: true }) || safeLocalSet(DB_KEY, JSON.stringify(compactDbForLocalStorage(importedDb)), { silent: true });
      showToast("Đã nhập JSON và đồng bộ lên MySQL. Nếu máy này đầy bộ nhớ, dữ liệu vẫn đã nằm trên database.");
    } else {
      const savedLocal = safeLocalSet(DB_KEY, JSON.stringify(importedDb));
      showToast(savedLocal ? "Đã nhập JSON vào máy này. Chưa đồng bộ MySQL vì chưa chạy chế độ online." : "Chưa nhập được vào máy này vì bộ nhớ trình duyệt đầy. Hãy bật MySQL rồi nhập lại.");
    }
    render();
  } catch (error) {
    console.error(error);
    showToast(isStorageQuotaError(error) ? "Bộ nhớ trình duyệt đầy. Hãy đăng nhập chế độ MySQL rồi nhập lại file JSON." : "Không đọc được file JSON. Hãy chọn đúng file sao lưu.");
  } finally {
    input.value = "";
  }
}

function isValidImportedDb(db) {
  return Boolean(db && typeof db === "object" && Array.isArray(db.users) && db.settings && typeof db.settings === "object");
}

async function backupWebsite() {
  const paths = [
    "index.html",
    "app.js",
    "styles.css",
    "server.js",
    "package.json",
    "assets/coco-bay-logo.jpg"
  ];
  try {
    const files = await Promise.all(paths.map(fetchBackupFile));
    const manifest = {
      app: "COCO BAY Internal Management",
      exportedAt: nowLocal(),
      note: "Gói ZIP này chứa mã nguồn website tĩnh. Database vận hành cần sao lưu riêng bằng nút Sao lưu database JSON.",
      files: paths
    };
    files.push({
      name: "BACKUP-README.json",
      data: new TextEncoder().encode(JSON.stringify(manifest, null, 2))
    });
    const blob = createZipBlob(files);
    downloadBlob(blob, `coco-bay-website-backup-${todayISO()}.zip`);
    showToast("Đã backup website ZIP.");
  } catch (error) {
    console.error(error);
    showToast("Không thể backup website. Hãy kiểm tra server local còn chạy.");
  }
}

async function fetchBackupFile(pathName) {
  const response = await fetch(`${pathName}?backup=${Date.now()}`);
  if (!response.ok) throw new Error(`Cannot fetch ${pathName}`);
  return {
    name: pathName,
    data: new Uint8Array(await response.arrayBuffer()),
    date: new Date()
  };
}

function createZipBlob(files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  files.forEach((file) => {
    const nameBytes = new TextEncoder().encode(file.name.replaceAll("\\", "/"));
    const crc = crc32(file.data);
    const { dosTime, dosDate } = zipDateParts(file.date || new Date());
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, file.data.length, true);
    localView.setUint32(22, file.data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);
    chunks.push(localHeader, file.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, file.data.length, true);
    centralView.setUint32(24, file.data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    central.push(centralHeader);
    offset += localHeader.length + file.data.length;
  });

  const centralOffset = offset;
  const centralSize = central.reduce((sum, item) => sum + item.length, 0);
  const endHeader = new Uint8Array(22);
  const endView = new DataView(endHeader.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  return new Blob([...chunks, ...central, endHeader], { type: "application/zip" });
}

function zipDateParts(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    dosTime: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    dosDate: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()
  };
}

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function exportRentalsExcel() {
  const db = getDb();
  const rows = filteredRentalRows(db);
  const tableRows = rows.map((r) => {
    const bike = db.motorbikes.find((item) => item.id === r.bikeId);
    return `<tr><td>${r.code}</td><td>${r.customer}</td><td>${r.phone}</td><td>${r.room}</td><td>${bike?.code || ""}</td><td>${bike?.name || ""}</td><td>${formatDateTime(r.start)}</td><td>${formatDateTime(r.end)}</td><td>${r.total || 0}</td><td>${r.paid || 0}</td><td>${Math.max(0, Number(r.total || 0) - Number(r.paid || 0))}</td><td>${r.status}</td></tr>`;
  }).join("");
  const html = `<table><thead><tr><th colspan="12">DANH SACH PHIEU THUE XE COCO BAY - ${formatDate(todayISO())}</th></tr><tr><th>Ma phieu</th><th>Khach</th><th>Dien thoai</th><th>Phong</th><th>Ma xe</th><th>Ten xe</th><th>Bat dau</th><th>Ket thuc</th><th>Tong tien</th><th>Da thu</th><th>Con lai</th><th>Trang thai</th></tr></thead><tbody>${tableRows || `<tr><td colspan="12">Khong co du lieu</td></tr>`}</tbody></table>`;
  const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `phieu-thue-xe-coco-bay-${todayISO()}.xls`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Đã xuất Excel phiếu thuê xe.");
}

function downloadBlob(blob, filename) {
  document.getElementById("download-fallback")?.remove();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  showDownloadFallback(url, filename);
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
    document.getElementById("download-fallback")?.remove();
  }, 60000);
}

function showDownloadFallback(url, filename) {
  const fallback = document.createElement("div");
  fallback.id = "download-fallback";
  fallback.className = "download-fallback";
  fallback.innerHTML = `
    <span>File đang được tải xuống.</span>
    <a href="${url}" download="${filename}">Bấm vào đây nếu chưa tải</a>
    <button type="button" aria-label="Đóng">×</button>
  `;
  fallback.querySelector("button").addEventListener("click", () => fallback.remove());
  document.body.appendChild(fallback);
}

function exportBikesExcel() {
  const db = getDb();
  const { rows } = filteredMotorbikeRows(db);
  const tableRows = rows.map((bike) => {
    const owner = db.owners.find((item) => item.id === bike.ownerId);
    return `<tr><td>${bike.code}</td><td>${bike.plate}</td><td>${bike.name}</td><td>${bike.brand || ""} ${bike.model || ""}</td><td>${owner?.name || ""}</td><td>${owner?.phone || ""}</td><td>${bike.status}</td><td>${bike.weekdayPrice || 0}</td><td>${bike.weekendPrice || 0}</td><td>${formatDate(bike.nextMaintenance)}</td><td>${oilHint(bike)}</td></tr>`;
  }).join("");
  const html = `
    <table>
      <thead><tr><th colspan="11">DANH SACH XE MAY COCO BAY - ${formatDate(todayISO())}</th></tr><tr><th>Ma xe</th><th>Bien so</th><th>Ten xe</th><th>Loai xe</th><th>Chu xe</th><th>Dien thoai</th><th>Trang thai</th><th>Gia ngay thuong</th><th>Gia cuoi tuan</th><th>Bao tri tiep theo</th><th>Ghi chu bao tri</th></tr></thead>
      <tbody>${tableRows || `<tr><td colspan="11">Khong co du lieu</td></tr>`}</tbody>
    </table>`;
  const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
  downloadBlob(blob, `danh-sach-xe-may-coco-bay-${todayISO()}.xls`);
  showToast("Đã xuất Excel danh sách xe máy.");
}

function exportCsv() {
  const db = getDb();
  const month = state.reportMonth || todayISO().slice(0, 7);
  const monthlyRental = monthlyBikeRentalReport(db, month);
  const monthlyOwnerRows = ownerRevenueRows(db, month);
  const finance = financeMonthStats(db, month);
  const rentalRows = finance.rentals.map((r) => {
    const bikeNames = rentalBikeIds(r).map((bikeId) => {
      const bike = db.motorbikes.find((item) => item.id === bikeId);
      return bike ? `${bike.code} - ${bike.name}` : "";
    }).filter(Boolean).join(", ");
    const ownerNames = [...new Set(rentalBikeIds(r).map((bikeId) => {
      const bike = db.motorbikes.find((item) => item.id === bikeId);
      return db.owners.find((owner) => owner.id === bike?.ownerId)?.name || "";
    }).filter(Boolean))].join(", ");
    return [r.code, r.customer, r.room, bikeNames, ownerNames, r.total, r.paid, Math.max(0, Number(r.total || 0) - Number(r.paid || 0)), r.status, formatDate(r.start)];
  });
  const html = `
    <html><head><meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #17313b; }
        h1 { color: #07566a; }
        h2 { margin-top: 26px; color: #07566a; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
        th { background: #0f5c6c; color: #fff; font-weight: 700; }
        td, th { border: 1px solid #b9d8dd; padding: 8px; vertical-align: top; }
        .kpi th { background: #e9f8f7; color: #07566a; }
        .money { mso-number-format:"#,##0"; font-weight: 700; }
      </style>
    </head><body>
      <h1>Báo cáo COCO BAY - tháng ${month}</h1>
      <p>Ngày xuất: ${formatDateTime(new Date())}</p>

      <h2>Tổng quan tài chính trong tháng</h2>
      ${excelTable(
        ["Doanh thu đã thu", "Còn phải thu", "Chi phí sửa xe", "Chi phí thiết bị", "Lợi nhuận tạm tính", "Số phiếu thuê"],
        [[finance.monthRevenue, finance.unpaid, finance.bikeRepair, finance.equipmentRepair, finance.profit, finance.rentalCount]],
        "kpi"
      )}

      <h2>Doanh thu và chi phí sửa xe theo chủ xe</h2>
      ${excelTable(
        ["Chủ xe", "Hình thức", "Số xe", "Số phiếu thuê", "Doanh thu đã thu", "Còn phải thu", "Chi phí sửa xe", "Lợi nhuận"],
        monthlyOwnerRows.map((row) => [row.owner.name, row.owner.type, row.bikeCount, row.rentalCount, row.revenue, row.receivable, row.repairCost, row.profit])
      )}

      <h2>Số lượng xe cho thuê trong tháng</h2>
      ${excelTable(
        ["Xe", "Biển số", "Chủ xe", "Số xe-ngày", "Số phiếu thuê", "Doanh thu đã thu", "Ngày phát sinh"],
        monthlyRental.rows.map((row) => [`${row.bike.code} - ${row.bike.name}`, row.bike.plate, row.owner?.name || "", row.bikeDays, row.rentalCount, row.revenue, row.days.map(formatDate).join(", ")])
      )}

      <h2>Chi tiết phiếu thuê trong tháng</h2>
      ${excelTable(
        ["Mã phiếu", "Khách", "Phòng", "Xe", "Chủ xe", "Tổng tiền", "Đã thanh toán", "Còn phải thu", "Trạng thái", "Ngày nhận"],
        rentalRows
      )}
    </body></html>`;
  const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
  downloadBlob(blob, `bao-cao-coco-bay-${month}.xls`);
  showToast("Đã xuất Excel báo cáo tháng.");
}

function excelTable(headers, rows, className = "") {
  return `<table class="${className}"><thead><tr>${headers.map((header) => `<th>${excelEscape(header)}</th>`).join("")}</tr></thead><tbody>
    ${(rows.length ? rows : [headers.map(() => "")]).map((row) => `<tr>${row.map((cell) => `<td>${excelEscape(cell)}</td>`).join("")}</tr>`).join("")}
  </tbody></table>`;
}

function excelEscape(value) {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function printReportPdf() {
  const db = getDb();
  const ownerRows = ownerRevenueRows(db);
  const monthlyOwnerRows = ownerRevenueRows(db, state.reportMonth);
  const bikeRows = bikeRevenueReportRows(db);
  const monthlyRental = monthlyBikeRentalReport(db, state.reportMonth);
  const totals = reportTotals(db, ownerRows);
  const popup = window.open("", "_blank", "width=1100,height=800");
  if (!popup) {
    showToast("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup để xuất PDF.");
    return;
  }
  popup.document.write(`
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>Báo cáo tổng hợp Coco Bay</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; color: #17313b; font-family: Arial, sans-serif; background: #f4f8f8; }
          .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm; background: white; }
          h1, h2, h3 { margin: 0; }
          .hero { display: flex; justify-content: space-between; gap: 20px; padding-bottom: 16px; border-bottom: 3px solid #19b6a3; }
          .hero p { margin: 8px 0 0; color: #667985; }
          .score { text-align: right; }
          .score span { color: #667985; }
          .score strong { display: block; margin-top: 6px; color: #027f9b; font-size: 26px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
          .kpi { border: 1px solid #d9e5e7; border-radius: 8px; padding: 12px; background: #effbfa; }
          .kpi span { display: block; color: #667985; font-size: 12px; }
          .kpi strong { display: block; margin-top: 8px; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; page-break-inside: avoid; }
          th, td { padding: 9px; border-bottom: 1px solid #d9e5e7; text-align: left; vertical-align: top; }
          th { color: #07566a; background: #e9f8f7; }
          section { margin-top: 20px; }
          .money { color: #027f9b; font-weight: 700; }
          .bar { height: 10px; border-radius: 99px; background: #e6eeee; overflow: hidden; }
          .bar i { display: block; height: 100%; background: linear-gradient(90deg, #19b6a3, #027f9b); }
          @page { size: A4; margin: 10mm; }
          @media print { body { background: white; } .page { width: auto; min-height: auto; margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        <main class="page">
          <div class="hero">
            <div>
              <h1>COCO BAY INTERNAL MANAGEMENT</h1>
              <p>Báo cáo tổng hợp vận hành xe máy và thiết bị</p>
              <p>Ngày xuất: ${formatDateTime(new Date())}</p>
            </div>
            <div class="score"><span>Lợi nhuận ước tính</span><strong>${money(totals.profit)}</strong></div>
          </div>
          <div class="grid">
            <div class="kpi"><span>Tổng doanh thu</span><strong>${money(totals.revenue)}</strong></div>
            <div class="kpi"><span>Còn phải thu</span><strong>${money(totals.receivable)}</strong></div>
            <div class="kpi"><span>Chi phí sửa xe</span><strong>${money(totals.repairCost)}</strong></div>
            <div class="kpi"><span>Số xe</span><strong>${totals.bikeCount}</strong></div>
          </div>
          <section>
            <h2>Doanh thu theo chủ xe</h2>
            ${printOwnerTable(ownerRows)}
          </section>
          <section>
            <h2>Doanh thu theo xe</h2>
            ${printBikeTable(bikeRows)}
          </section>
          <section>
            <h2>Thiết bị cần chú ý</h2>
            ${printEquipmentTable(db)}
          </section>
          <section>
            <h2>So luong xe cho thue thang ${monthlyRental.month}</h2>
            <div class="grid">
              <div class="kpi"><span>Tong xe-ngay</span><strong>${monthlyRental.totalBikeDays}</strong></div>
              <div class="kpi"><span>So xe co phat sinh thue</span><strong>${monthlyRental.rentedBikeCount}</strong></div>
              <div class="kpi"><span>So phieu thue</span><strong>${monthlyRental.rentalCount}</strong></div>
              <div class="kpi"><span>Binh quan/ngay</span><strong>${monthlyRental.daysInMonth ? (monthlyRental.totalBikeDays / monthlyRental.daysInMonth).toFixed(1) : "0.0"}</strong></div>
            </div>
            ${printMonthlyBikeRentalTable(monthlyRental)}
          </section>
          <section>
            <h2>Doanh thu va chi phi sua xe theo chu xe thang ${state.reportMonth}</h2>
            ${printOwnerTable(monthlyOwnerRows)}
          </section>
        </main>
        <script>
          window.addEventListener("load", () => {
            window.focus();
            window.print();
          });
        </script>
      </body>
    </html>
  `);
  popup.document.close();
}

function attendanceExportRows(db = getDb()) {
  const records = attendanceFilteredRecords(db);
  return records.map((record) => {
    const employee = db.hrEmployees.find((item) => item.id === record.employeeId) || {};
    const shift = db.attendanceShifts.find((item) => item.id === record.shiftId) || {};
    return {
      date: formatDate(record.date),
      code: employee.code || "",
      name: employee.name || "",
      department: employee.department || "",
      position: employee.position || "",
      shift: shift.name || "",
      shiftTime: `${shift.start || ""}-${shift.end || ""}`,
      checkIn: record.checkIn || "",
      checkOut: record.checkOut || "",
      hours: attendanceHours(record, shift).toFixed(1),
      status: record.status,
      note: record.note || ""
    };
  });
}

function attendancePeriodLabel() {
  const { period, date, month, year } = state.attendance;
  if (period === "day") return formatDate(date);
  if (period === "month") return month;
  return year;
}

function exportAttendanceExcel() {
  const rows = attendanceExportRows();
  const html = `
    <table>
      <thead><tr><th colspan="12">BẢNG CHẤM CÔNG COCO BAY - ${attendancePeriodLabel()}</th></tr>
      <tr><th>Ngày</th><th>Mã NV</th><th>Nhân viên</th><th>Bộ phận</th><th>Vị trí</th><th>Ca</th><th>Giờ ca</th><th>Vào</th><th>Ra</th><th>Giờ công</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
      <tbody>${rows.map((row) => `<tr><td>${row.date}</td><td>${row.code}</td><td>${row.name}</td><td>${row.department}</td><td>${row.position}</td><td>${row.shift}</td><td>${row.shiftTime}</td><td>${row.checkIn}</td><td>${row.checkOut}</td><td>${row.hours}</td><td>${row.status}</td><td>${row.note}</td></tr>`).join("")}</tbody>
    </table>`;
  const blob = new Blob(["\ufeff" + html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cham-cong-coco-bay-${attendancePeriodLabel()}.xls`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Đã xuất file Excel chấm công.");
}

function printAttendancePdf() {
  const db = getDb();
  const rows = attendanceExportRows(db);
  const summary = attendanceSummaryRows(db, attendanceFilteredRecords(db));
  const popup = window.open("", "_blank", "width=1100,height=800");
  if (!popup) {
    showToast("Trình duyệt đang chặn cửa sổ in. Hãy cho phép popup để xuất PDF.");
    return;
  }
  popup.document.write(`
    <!doctype html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <title>Bảng chấm công Coco Bay</title>
        <style>
          body { margin: 0; color: #17313b; font-family: Arial, sans-serif; }
          .page { padding: 16mm; }
          h1, h2 { margin: 0 0 8px; }
          p { margin: 0 0 14px; color: #667985; }
          table { width: 100%; border-collapse: collapse; margin: 12px 0 22px; }
          th, td { border: 1px solid #d9e5e7; padding: 7px; text-align: left; font-size: 12px; }
          th { background: #fff600; color: #111; }
          .section th { background: #e9f8f7; color: #07566a; }
          @page { size: A4 landscape; margin: 10mm; }
        </style>
      </head>
      <body>
        <main class="page">
          <h1>BẢNG CHẤM CÔNG COCO BAY</h1>
          <p>Kỳ chấm công: ${attendancePeriodLabel()} · Ngày xuất: ${formatDateTime(new Date())}</p>
          <h2>Tổng hợp công</h2>
          <table class="section"><thead><tr><th>Nhân viên</th><th>Bộ phận</th><th>Ngày công</th><th>Giờ công</th><th>Đi trễ</th><th>Nghỉ/vắng</th></tr></thead>
            <tbody>${summary.map((row) => `<tr><td>${row.employee.code}  · ${row.employee.name}</td><td>${row.employee.department}</td><td>${row.workDays.toFixed(1)}</td><td>${row.hours.toFixed(1)}</td><td>${row.late}</td><td>${row.absent}</td></tr>`).join("")}</tbody></table>
          <h2>Chi tiết chấm công</h2>
          <table><thead><tr><th>Ngày</th><th>Mã NV</th><th>Nhân viên</th><th>Bộ phận</th><th>Vị trí</th><th>Ca</th><th>Giờ ca</th><th>Vào</th><th>Ra</th><th>Giờ công</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead>
            <tbody>${rows.map((row) => `<tr><td>${row.date}</td><td>${row.code}</td><td>${row.name}</td><td>${row.department}</td><td>${row.position}</td><td>${row.shift}</td><td>${row.shiftTime}</td><td>${row.checkIn}</td><td>${row.checkOut}</td><td>${row.hours}</td><td>${row.status}</td><td>${row.note}</td></tr>`).join("")}</tbody></table>
        </main>
        <script>window.addEventListener("load", () => { window.focus(); window.print(); });</script>
      </body>
    </html>
  `);
  popup.document.close();
}

function printOwnerTable(rows) {
  return `<table><thead><tr><th>Chủ xe</th><th>Số xe</th><th>Phiếu thuê</th><th>Doanh thu</th><th>Còn phải thu</th><th>Chi phí sửa</th><th>Lợi nhuận</th></tr></thead><tbody>
    ${rows.map((row) => `<tr><td><strong>${row.owner.name}</strong><br>${row.owner.type}</td><td>${row.bikeCount}</td><td>${row.rentalCount}</td><td class="money">${money(row.revenue)}</td><td>${money(row.receivable)}</td><td>${money(row.repairCost)}</td><td class="money">${money(row.profit)}</td></tr>`).join("")}
  </tbody></table>`;
}

function printBikeTable(rows) {
  const max = Math.max(1, ...rows.map((row) => row.revenue));
  return `<table><thead><tr><th>Xe</th><th>Chủ xe</th><th>Trạng thái</th><th>Doanh thu</th><th>Tỷ trọng</th></tr></thead><tbody>
    ${rows.map((row) => `<tr><td><strong>${row.bike.code}</strong><br>${row.bike.name}</td><td>${row.owner?.name || "-"}</td><td>${row.bike.status}</td><td class="money">${money(row.revenue)}</td><td><div class="bar"><i style="width:${Math.max(4, Math.round((row.revenue / max) * 100))}%"></i></div></td></tr>`).join("")}
  </tbody></table>`;
}

function printMonthlyBikeRentalTable(report) {
  return `<table><thead><tr><th>Xe</th><th>Chu xe</th><th>So xe-ngay</th><th>So phieu</th><th>Doanh thu</th><th>Ngay phat sinh</th></tr></thead><tbody>
    ${report.rows.map((row) => `<tr><td><strong>${row.bike.code}</strong><br>${row.bike.name}</td><td>${row.owner?.name || "-"}</td><td>${row.bikeDays}</td><td>${row.rentalCount}</td><td class="money">${money(row.revenue)}</td><td>${row.days.map(formatDate).join(", ")}</td></tr>`).join("") || `<tr><td colspan="6">Thang nay chua co xe duoc thue.</td></tr>`}
  </tbody></table>`;
}

function printEquipmentTable(db) {
  const rows = db.equipment.filter((item) => item.condition !== "Hoạt động" || new Date(item.nextMaintenance) <= new Date(todayISO(30)));
  return `<table><thead><tr><th>Mã</th><th>Thiết bị</th><th>Vị trí</th><th>Tình trạng</th><th>Bảo trì tiếp theo</th><th>Chi phí sửa</th></tr></thead><tbody>
    ${rows.map((item) => `<tr><td>${item.code}</td><td>${item.name}</td><td>${item.room || item.area}</td><td>${item.condition}</td><td>${formatDate(item.nextMaintenance)}</td><td>${money(item.repairCost)}</td></tr>`).join("") || `<tr><td colspan="6">Không có thiết bị cần chú ý.</td></tr>`}
  </tbody></table>`;
}

async function previewPhoto(event) {
  const file = event.target.files[0];
  const preview = document.getElementById("photo-preview");
  if (!file || !preview) return;
  const src = await compressImageFile(file, 720, 0.5, 90000);
  preview.innerHTML = `<img src="${src}" alt="Ảnh sau khi nhận xe">`;
}

async function readBikeImages(form, id) {
  const input = form.querySelector("input[name='bikeImages']");
  const files = Array.from(input?.files || []);
  if (state.bikeImageDraft?.images) return state.bikeImageDraft.images;
  if (!files.length) {
    return getDb().motorbikes.find((b) => b.id === id)?.images || [];
  }
  if (files.length > BIKE_IMAGE_LIMIT) {
    showToast(`Chỉ lưu tối đa ${BIKE_IMAGE_LIMIT} hình cho mỗi xe.`);
  }
  return Promise.all(files.slice(0, BIKE_IMAGE_LIMIT).map(compressBikeImageFile));
}

async function normalizeBikeImages(images = []) {
  const uniqueImages = images.filter(Boolean).slice(0, BIKE_IMAGE_LIMIT);
  return Promise.all(uniqueImages.map(async (src) => {
    if (isLikelyBrokenImage(src)) return src;
    if (String(src).startsWith("data:image/") && src.length > BIKE_IMAGE_MAX_BYTES) {
      const compressed = await compressImageSource(src, BIKE_IMAGE_MAX_SIZE, BIKE_IMAGE_QUALITY, BIKE_IMAGE_MAX_BYTES);
      return uploadImageDataUrl(await isBrokenCompressedImage(compressed) ? src : compressed, "bikes");
    }
    if (String(src).startsWith("data:image/")) {
      return uploadImageDataUrl(src, "bikes");
    }
    return src;
  }));
}

async function compressBikeImageFile(file) {
  const src = await compressImageFile(file, BIKE_IMAGE_MAX_SIZE, BIKE_IMAGE_QUALITY, BIKE_IMAGE_MAX_BYTES);
  return uploadImageDataUrl(src, "bikes");
}

async function uploadImageDataUrl(src, folder = "general") {
  if (!String(src || "").startsWith("data:image/")) return src;
  try {
    const payload = await apiRequest("/uploads", { method: "POST", body: JSON.stringify({ image: src, folder }) });
    return payload.url || src;
  } catch (error) {
    console.warn("Không upload được ảnh thành file riêng, giữ ảnh trong dữ liệu local.", error);
    return src;
  }
}

async function deleteUploadedImages(urls = []) {
  const uploadUrls = [...new Set(urls.filter((url) => String(url || "").startsWith("/uploads/")))];
  if (!uploadUrls.length) return;
  const results = await Promise.allSettled(uploadUrls.map((url) => apiRequest("/uploads", {
    method: "DELETE",
    body: JSON.stringify({ url })
  })));
  const failed = results.filter((result) => result.status === "rejected").length;
  if (failed) {
    showToast(`Đã lưu xe, nhưng ${failed} ảnh cũ chưa xóa được trên hosting.`);
  } else {
    showToast(`Đã xóa ${uploadUrls.length} ảnh cũ trên hosting.`);
  }
}

async function readEmployeePhoto(form, id) {
  const input = form.querySelector("input[name='employeePhoto']");
  const file = input?.files?.[0];
  if (!file) {
    return getDb().hrEmployees.find((item) => item.id === id)?.photo || "";
  }
  return compressImageFile(file, 640, 0.46, 80000);
}

async function readApplicantPhoto(form, id) {
  const input = form.querySelector("input[name='applicantPhoto']");
  const file = input?.files?.[0];
  if (!file) {
    return getDb().jobApplicants.find((item) => item.id === id)?.photo || "";
  }
  return compressImageFile(file, 640, 0.46, 80000);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImageFile(file, maxSize = 760, quality = 0.5, maxBytes = 90000) {
  const src = await fileToDataUrl(file);
  try {
    const compressed = await compressImageSource(src, maxSize, quality, maxBytes);
    if (await isBrokenCompressedImage(compressed)) return src;
    return compressed;
  } catch (error) {
    console.warn("Không nén được ảnh, dùng ảnh gốc để vẫn hiển thị.", error);
    return src;
  }
}

function imageDimensions(src) {
  return new Promise((resolve) => {
    if (!String(src || "").startsWith("data:image/")) {
      resolve({ width: 0, height: 0 });
      return;
    }
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth || image.width || 0, height: image.naturalHeight || image.height || 0 });
    image.onerror = () => resolve({ width: 0, height: 0 });
    image.src = src;
  });
}

async function isBrokenCompressedImage(src) {
  if (isLikelyBrokenImage(src)) return true;
  const size = await imageDimensions(src);
  return size.width <= 4 || size.height <= 4;
}

function compressImageSource(src, maxSize = 760, quality = 0.5, maxBytes = 90000) {
  return new Promise((resolve, reject) => {
    if (!String(src).startsWith("data:image/")) {
      resolve(src);
      return;
    }
    const image = new Image();
    image.onload = () => {
      const attempts = [
        [maxSize, quality],
        [640, 0.46],
        [520, 0.42],
        [420, 0.38],
        [360, 0.34],
        [300, 0.32]
      ];
      let best = "";
      for (const [size, q] of attempts) {
        const scale = Math.min(1, size / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const candidate = canvas.toDataURL("image/jpeg", q);
        best = !best || candidate.length < best.length ? candidate : best;
        if (candidate.length <= maxBytes) {
          resolve(candidate);
          return;
        }
      }
      resolve(best);
    };
    image.onerror = reject;
    image.src = src;
  });
}

async function previewBikeImages(event) {
  const preview = document.getElementById("bike-image-preview");
  if (!preview) return;
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const current = state.bikeImageDraft?.images || [];
  const slots = Math.max(0, BIKE_IMAGE_LIMIT - current.length);
  if (!slots) {
    showToast(`Đã đủ ${BIKE_IMAGE_LIMIT} hình. Hãy xóa bớt hình trước khi thêm.`);
    event.target.value = "";
    return;
  }
  if (files.length > slots) showToast(`Chỉ thêm được ${slots} hình nữa. Hệ thống sẽ lấy hình đầu tiên.`);
  preview.innerHTML = `<span>Đang nén và upload ảnh thành file riêng...</span>`;
  const urls = await Promise.all(files.slice(0, slots).map(compressBikeImageFile));
  state.bikeImageDraft = state.bikeImageDraft || { formId: "new", images: [] };
  state.bikeImageDraft.images = [...current, ...urls].slice(0, BIKE_IMAGE_LIMIT);
  preview.innerHTML = renderEditableBikeImages(state.bikeImageDraft.images);
  event.target.value = "";
}

async function previewEmployeePhoto(event) {
  const preview = document.getElementById("employee-photo-preview");
  const file = event.target.files?.[0];
  if (!preview || !file) return;
  const src = await fileToDataUrl(file);
  preview.innerHTML = `<img src="${src}" alt="Ảnh nhân viên">`;
}

async function previewApplicantPhoto(event) {
  const preview = document.getElementById("applicant-photo-preview");
  const file = event.target.files?.[0];
  if (!preview || !file) return;
  const src = await fileToDataUrl(file);
  preview.innerHTML = `<img src="${src}" alt="Ảnh ứng viên">`;
}

window.addEventListener("error", (event) => {
  if (String(event.message).includes("Duplicate bike")) return;
  if (String(event.message).includes("Duplicate attendance")) return;
  console.error(event.error || event.message);
});

appInit();
