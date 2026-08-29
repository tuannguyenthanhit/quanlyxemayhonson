const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");

let mysql = null;
try {
  mysql = require("mysql2/promise");
} catch {
  mysql = null;
}

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const maxBodyBytes = Number(process.env.MAX_BODY_MB || 120) * 1024 * 1024;
const sessionDays = Math.max(1, Number(process.env.SESSION_DAYS || 30));
const sessions = new Map();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  charset: "utf8mb4"
};

const hasMysqlConfig = Boolean(dbConfig.host && dbConfig.user && dbConfig.database && mysql);
const pool = hasMysqlConfig ? mysql.createPool(dbConfig) : null;
let schemaReadyPromise = null;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

const compressibleTypes = new Set([
  "text/html; charset=utf-8",
  "text/css; charset=utf-8",
  "application/javascript; charset=utf-8",
  "application/json; charset=utf-8",
  "image/svg+xml"
]);

function defaultDb() {
  return {
    users: [{
      id: "u-admin",
      name: "Chủ Coco Bay",
      email: process.env.ADMIN_EMAIL || "admin@cocobay.vn",
      password: process.env.ADMIN_PASSWORD || "123456",
      role: "admin",
      permissions: ["finance", "users", "settings", "reports", "audit", "costs", "manage", "hr", "booking_view", "booking_write", "booking_edit", "marketing_view", "marketing_manage", "kitchen_view", "kitchen_manage"],
      active: true,
      lastLoginAt: ""
    }],
    owners: [],
    motorbikes: [],
    rentals: [],
    equipment: [],
    tickets: [],
    notifications: [],
    hotels: [],
    rooms: [],
    hotelBookings: [],
    marketingAssets: [],
    recoveryRequests: [],
    hrEmployees: [],
    jobApplicants: [],
    attendanceShifts: [],
    attendanceRecords: [],
    bikeTypes: [],
    equipmentTypes: [],
    kitchenCategories: ["Lẩu", "Nướng", "Chiên", "Luộc", "Tráng miệng", "Bánh"].map((name, index) => ({ id: `KC-${index + 1}`, name, sortOrder: index + 1, active: true })),
    dishes: [],
    kitchenRecipes: [],
    sauces: [],
    auditLogs: [],
    settings: {
      timezone: "Asia/Ho_Chi_Minh",
      currency: "VND",
      dateFormat: "dd/mm/yyyy",
      deletedSeedBookings: []
    }
  };
}

async function ensureSchema() {
  if (!pool) return;
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_data (
          id INT PRIMARY KEY,
          json_data LONGTEXT NOT NULL,
          data_version BIGINT NOT NULL DEFAULT 1,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      const [versionColumns] = await pool.query(`
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'app_data' AND COLUMN_NAME = 'data_version'
        LIMIT 1
      `, [dbConfig.database]);
      if (!versionColumns.length) {
        await pool.query("ALTER TABLE app_data ADD COLUMN data_version BIGINT NOT NULL DEFAULT 1 AFTER json_data");
      }
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_sessions (
          token_hash CHAR(64) PRIMARY KEY,
          user_id VARCHAR(80) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          INDEX idx_app_sessions_user (user_id),
          INDEX idx_app_sessions_expires (expires_at)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS app_uploads (
          id CHAR(32) PRIMARY KEY,
          folder VARCHAR(32) NOT NULL DEFAULT 'general',
          mime_type VARCHAR(50) NOT NULL,
          file_ext VARCHAR(8) NOT NULL,
          byte_size INT UNSIGNED NOT NULL,
          file_data LONGBLOB NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_app_uploads_folder (folder),
          INDEX idx_app_uploads_created (created_at)
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
      `);
      await pool.query("DELETE FROM app_sessions WHERE expires_at <= NOW()");
      const [rows] = await pool.query("SELECT id FROM app_data WHERE id = 1 LIMIT 1");
      if (!rows.length) {
        await pool.query("INSERT INTO app_data (id, json_data, data_version) VALUES (1, ?, 1)", [JSON.stringify(defaultDb())]);
      }
    })().catch((error) => {
      schemaReadyPromise = null;
      throw error;
    });
  }
  await schemaReadyPromise;
}

async function readDbRecord() {
  await ensureSchema();
  const [rows] = await pool.query("SELECT json_data, data_version, updated_at FROM app_data WHERE id = 1 LIMIT 1");
  if (!rows.length) {
    const error = new Error("Không tìm thấy dữ liệu hệ thống trên MySQL.");
    error.statusCode = 500;
    throw error;
  }
  try {
    return {
      db: JSON.parse(rows[0].json_data),
      version: Number(rows[0].data_version || 1),
      updatedAt: rows[0].updated_at
    };
  } catch (error) {
    error.message = "Dữ liệu JSON trên MySQL bị lỗi. Hệ thống đã dừng để tránh ghi đè dữ liệu.";
    error.statusCode = 500;
    throw error;
  }
}

async function readDb() {
  return (await readDbRecord()).db;
}

async function writeDb(data, expectedVersion = null) {
  await ensureSchema();
  if (Number.isInteger(expectedVersion)) {
    const [result] = await pool.query(
      "UPDATE app_data SET json_data = ?, data_version = data_version + 1 WHERE id = 1 AND data_version = ?",
      [JSON.stringify(data), expectedVersion]
    );
    if (!result.affectedRows) {
      const error = new Error("Dữ liệu trên máy chủ đã được thiết bị khác cập nhật. Vui lòng tải lại dữ liệu mới.");
      error.statusCode = 409;
      error.code = "DATA_CONFLICT";
      throw error;
    }
  } else {
    await pool.query(
      `INSERT INTO app_data (id, json_data, data_version)
       VALUES (1, ?, 1)
       ON DUPLICATE KEY UPDATE json_data = VALUES(json_data), data_version = data_version + 1`,
      [JSON.stringify(data)]
    );
  }
  const [rows] = await pool.query("SELECT data_version, updated_at FROM app_data WHERE id = 1 LIMIT 1");
  return {
    version: Number(rows[0]?.data_version || 1),
    updatedAt: rows[0]?.updated_at || null
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBodyBytes) {
        const error = new Error("Payload too large");
        error.statusCode = 413;
        reject(error);
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(payload));
}

const marketingAssetTypes = new Set(["Video", "Hình ảnh", "Thư mục hình ảnh", "Tài liệu khác"]);

function normalizeMarketingAssetUrl(value = "") {
  const raw = String(value || "").trim();
  const iframeSource = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i)?.[1];
  const source = (iframeSource || raw).replaceAll("&amp;", "&").trim();
  try {
    const parsed = new URL(source);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
}

function marketingAssetPayload(body, user, existing = {}) {
  const title = String(body.title || "").trim();
  const url = normalizeMarketingAssetUrl(body.url);
  if (!title || !url) {
    const error = new Error("Tên dữ liệu và liên kết hợp lệ là bắt buộc.");
    error.statusCode = 400;
    throw error;
  }
  const now = new Date().toISOString();
  return {
    ...existing,
    title,
    type: marketingAssetTypes.has(body.type) ? body.type : "Tài liệu khác",
    category: String(body.category || "").trim(),
    url,
    description: String(body.description || "").trim(),
    updatedAt: now,
    updatedBy: user.name || ""
  };
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function saveUploadedImage(dataUrl, folder = "general") {
  const match = String(dataUrl || "").match(/^data:image\/(png|jpe?g|webp);base64,([a-z0-9+/=]+)$/i);
  if (!match) {
    const error = new Error("File ảnh không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }
  const ext = match[1].toLowerCase().replace("jpeg", "jpg");
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 3 * 1024 * 1024) {
    const error = new Error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.");
    error.statusCode = 413;
    throw error;
  }
  const safeFolder = String(folder || "general").replace(/[^a-z0-9_-]/gi, "").slice(0, 32) || "general";
  if (pool) {
    await ensureSchema();
    const id = crypto.randomBytes(16).toString("hex");
    const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    await pool.query(
      "INSERT INTO app_uploads (id, folder, mime_type, file_ext, byte_size, file_data) VALUES (?, ?, ?, ?, ?, ?)",
      [id, safeFolder, mimeType, ext, buffer.length, buffer]
    );
    return `/uploads/db/${id}.${ext}`;
  }
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uploadDir = path.join(root, "uploads", safeFolder, month);
  ensureDir(uploadDir);
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${ext}`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${safeFolder}/${month}/${filename}`;
}

async function deleteUploadedImage(url) {
  const cleanUrl = String(url || "").split("?")[0];
  const databaseImage = cleanUrl.match(/^\/uploads\/db\/([a-f0-9]{32})(?:\.[a-z0-9]+)?$/i);
  if (databaseImage) {
    if (!pool) return { deleted: false, missing: true };
    await ensureSchema();
    const [result] = await pool.query("DELETE FROM app_uploads WHERE id = ?", [databaseImage[1]]);
    return { deleted: Boolean(result.affectedRows), missing: !result.affectedRows };
  }
  if (!cleanUrl.startsWith("/uploads/")) {
    return { deleted: false, skipped: true };
  }
  const relativePath = cleanUrl.replace(/^\/+/, "").replace(/\//g, path.sep);
  const uploadsRoot = path.join(root, "uploads");
  const filePath = path.normalize(path.join(root, relativePath));
  if (!filePath.startsWith(uploadsRoot + path.sep)) {
    const error = new Error("Đường dẫn ảnh không hợp lệ.");
    error.statusCode = 400;
    throw error;
  }
  if (!fs.existsSync(filePath)) {
    return { deleted: false, missing: true };
  }
  fs.unlinkSync(filePath);
  return { deleted: true };
}

async function serveDatabaseUpload(req, res, urlPath) {
  const match = String(urlPath || "").match(/^\/uploads\/db\/([a-f0-9]{32})(?:\.[a-z0-9]+)?$/i);
  if (!match) return false;
  if (!pool) {
    res.writeHead(404, { "Cache-Control": "no-store" });
    res.end("Image not found");
    return true;
  }
  try {
    await ensureSchema();
    const [rows] = await pool.query(
      "SELECT mime_type, byte_size, file_data FROM app_uploads WHERE id = ? LIMIT 1",
      [match[1]]
    );
    if (!rows.length) {
      res.writeHead(404, { "Cache-Control": "no-store" });
      res.end("Image not found");
      return true;
    }
    const image = rows[0];
    res.writeHead(200, {
      "Content-Type": image.mime_type,
      "Content-Length": Number(image.byte_size || image.file_data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff"
    });
    if (req.method === "HEAD") res.end();
    else res.end(image.file_data);
  } catch (error) {
    res.writeHead(500, { "Cache-Control": "no-store" });
    res.end("Unable to load image");
  }
  return true;
}

function parseCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || "").split(";").map((item) => item.trim()).filter(Boolean).map((item) => {
    const index = item.indexOf("=");
    return [decodeURIComponent(item.slice(0, index)), decodeURIComponent(item.slice(index + 1))];
  }));
}

function sessionTokenHash(token) {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex");
}

function sessionExpiresAt() {
  return new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
}

async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const session = { userId, createdAt: Date.now(), expiresAt: sessionExpiresAt().toISOString() };
  sessions.set(token, session);
  if (pool) {
    await ensureSchema();
    await pool.query(
      "INSERT INTO app_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
      [sessionTokenHash(token), userId, session.expiresAt.slice(0, 19).replace("T", " ")]
    );
  }
  return token;
}

async function currentSession(req) {
  const token = parseCookies(req).coco_session;
  if (!token) return null;
  const cached = sessions.get(token);
  if (cached && new Date(cached.expiresAt || 0) > new Date()) return cached;
  if (!pool) return cached || null;
  await ensureSchema();
  const [rows] = await pool.query(
    "SELECT user_id, created_at, expires_at FROM app_sessions WHERE token_hash = ? AND expires_at > NOW() LIMIT 1",
    [sessionTokenHash(token)]
  );
  if (!rows.length) {
    sessions.delete(token);
    return null;
  }
  const session = {
    userId: rows[0].user_id,
    createdAt: new Date(rows[0].created_at).getTime(),
    expiresAt: new Date(rows[0].expires_at).toISOString()
  };
  sessions.set(token, session);
  return session;
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `coco_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${sessionDays * 24 * 60 * 60}`);
}

async function destroySession(req) {
  const token = parseCookies(req).coco_session;
  if (!token) return;
  sessions.delete(token);
  if (pool) {
    await ensureSchema();
    await pool.query("DELETE FROM app_sessions WHERE token_hash = ?", [sessionTokenHash(token)]);
  }
}

function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", "coco_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function staticCacheHeader(filePath) {
  const ext = path.extname(filePath);
  if (ext === ".html") return "no-store, max-age=0";
  return "public, max-age=31536000, immutable";
}

function sendStatic(req, res, filePath, data) {
  const contentType = types[path.extname(filePath)] || "application/octet-stream";
  const headers = {
    "Content-Type": contentType,
    "Cache-Control": staticCacheHeader(filePath)
  };
  if (compressibleTypes.has(contentType) && /\bgzip\b/.test(req.headers["accept-encoding"] || "")) {
    zlib.gzip(data, (error, gzipped) => {
      if (error) {
        res.writeHead(200, headers);
        res.end(data);
        return;
      }
      res.writeHead(200, { ...headers, "Content-Encoding": "gzip", "Vary": "Accept-Encoding" });
      res.end(gzipped);
    });
    return;
  }
  res.writeHead(200, headers);
  res.end(data);
}

async function handleApi(req, res, urlPath) {
  if (urlPath === "/api/uploads" && req.method === "POST") {
    try {
      if (pool && !(await currentSession(req))) {
        sendJson(res, 401, { ok: false, message: "Chưa đăng nhập." });
        return true;
      }
      const body = await readBody(req);
      const url = await saveUploadedImage(body.image, body.folder || "general");
      sendJson(res, 200, { ok: true, url });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message });
    }
    return true;
  }

  if (urlPath === "/api/uploads" && req.method === "DELETE") {
    try {
      if (pool && !(await currentSession(req))) {
        sendJson(res, 401, { ok: false, message: "Chưa đăng nhập." });
        return true;
      }
      const body = await readBody(req);
      const result = await deleteUploadedImage(body.url);
      sendJson(res, 200, { ok: true, ...result });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message });
    }
    return true;
  }

  if (!pool) {
    sendJson(res, 503, { ok: false, mode: "localStorage", message: "MySQL is not configured on this server." });
    return true;
  }

  if (urlPath === "/api/health") {
    try {
      await ensureSchema();
      sendJson(res, 200, { ok: true, mode: "mysql" });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message });
    }
    return true;
  }

  if (urlPath === "/api/login" && req.method === "POST") {
    try {
      const body = await readBody(req);
      const record = await readDbRecord();
      const db = record.db;
      const email = String(body.email || "").trim();
      const password = String(body.password || "").trim();
      const envAdminEmail = String(process.env.ADMIN_EMAIL || "admin@cocobay.vn").trim();
      const envAdminPassword = String(process.env.ADMIN_PASSWORD || "").trim();
      let user = (db.users || []).find((item) => item.email === email && item.password === password && item.active);
      if (!user && envAdminPassword && email === envAdminEmail && password === envAdminPassword) {
        user = (db.users || []).find((item) => item.email === envAdminEmail && item.active);
        if (user) user.password = envAdminPassword;
      }
      if (!user) {
        sendJson(res, 401, { ok: false, message: "Email hoặc mật khẩu không đúng." });
        return true;
      }
      user.lastLoginAt = new Date().toISOString();
      db.auditLogs = Array.isArray(db.auditLogs) ? db.auditLogs : [];
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        user: user.name,
        role: user.role,
        action: "Đăng nhập",
        record: user.email,
        before: "",
        after: `Lần đăng nhập gần nhất: ${user.lastLoginAt}`,
        createdAt: user.lastLoginAt
      });
      const saved = await writeDb(db, record.version);
      const token = await createSession(user.id);
      setSessionCookie(res, token);
      sendJson(res, 200, { ok: true, user, db, version: saved.version, updatedAt: saved.updatedAt });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message });
    }
    return true;
  }

  if (urlPath === "/api/logout" && req.method === "POST") {
    await destroySession(req);
    clearSessionCookie(res);
    sendJson(res, 200, { ok: true });
    return true;
  }

  const session = await currentSession(req);
  if (!session) {
    sendJson(res, 401, { ok: false, message: "Chưa đăng nhập." });
    return true;
  }

  if (urlPath === "/api/me" && req.method === "GET") {
    const record = await readDbRecord();
    const db = record.db;
    const user = (db.users || []).find((item) => item.id === session.userId && item.active);
    if (!user) {
      sendJson(res, 401, { ok: false, message: "Phiên đăng nhập không hợp lệ." });
      return true;
    }
    sendJson(res, 200, { ok: true, user, db, version: record.version, updatedAt: record.updatedAt });
    return true;
  }

  if (urlPath === "/api/data" && req.method === "GET") {
    const record = await readDbRecord();
    sendJson(res, 200, { ok: true, db: record.db, version: record.version, updatedAt: record.updatedAt });
    return true;
  }

  const marketingAssetRoute = urlPath.match(/^\/api\/marketing-assets(?:\/([^/]+))?$/);
  if (marketingAssetRoute && ["POST", "PUT", "DELETE"].includes(req.method)) {
    try {
      const record = await readDbRecord();
      const db = record.db;
      const user = (db.users || []).find((item) => item.id === session.userId && item.active);
      const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
      if (!user || (user.role !== "admin" && !userPermissions.includes("marketing_manage"))) {
        sendJson(res, 403, { ok: false, message: "Tài khoản này chỉ được xem, không có quyền thay đổi dữ liệu Marketing dùng chung." });
        return true;
      }
      db.marketingAssets = Array.isArray(db.marketingAssets) ? db.marketingAssets : [];
      db.auditLogs = Array.isArray(db.auditLogs) ? db.auditLogs : [];
      const id = marketingAssetRoute[1] ? decodeURIComponent(marketingAssetRoute[1]) : "";
      let asset = null;
      let action = "";
      let before = "";

      if (req.method === "POST") {
        if (id) {
          sendJson(res, 400, { ok: false, message: "Đường dẫn thêm dữ liệu không hợp lệ." });
          return true;
        }
        const body = await readBody(req);
        asset = marketingAssetPayload(body, user);
        asset.id = `MKT-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`.toUpperCase();
        asset.createdAt = asset.updatedAt;
        asset.createdBy = user.name || "";
        db.marketingAssets.unshift(asset);
        action = "Thêm dữ liệu Marketing";
      } else {
        const index = db.marketingAssets.findIndex((item) => item.id === id);
        if (index < 0) {
          sendJson(res, 404, { ok: false, message: "Không tìm thấy dữ liệu Marketing." });
          return true;
        }
        const existing = db.marketingAssets[index];
        before = `${existing.title || ""} · ${existing.url || ""}`;
        if (req.method === "PUT") {
          const body = await readBody(req);
          asset = marketingAssetPayload(body, user, existing);
          db.marketingAssets[index] = asset;
          action = "Cập nhật dữ liệu Marketing";
        } else {
          asset = existing;
          db.marketingAssets.splice(index, 1);
          action = "Xóa dữ liệu Marketing";
        }
      }

      db.auditLogs.unshift({
        id: `LOG-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
        user: user.name,
        role: user.role,
        action,
        record: asset.title || asset.id,
        before,
        after: req.method === "DELETE" ? "Đã xóa liên kết Marketing" : `${asset.title} · ${asset.url}`,
        createdAt: new Date().toISOString()
      });
      const saved = await writeDb(db, record.version);
      sendJson(res, 200, { ok: true, asset, db, version: saved.version, updatedAt: saved.updatedAt });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, message: error.message });
    }
    return true;
  }

  if (urlPath.startsWith("/api/bookings/") && req.method === "DELETE") {
    try {
      const record = await readDbRecord();
      const db = record.db;
      const user = (db.users || []).find((item) => item.id === session.userId && item.active);
      const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
      if (!user || (user.role !== "admin" && !userPermissions.includes("booking_edit"))) {
        sendJson(res, 403, { ok: false, message: "Tài khoản này không có quyền xóa/sửa đặt phòng." });
        return true;
      }
      const id = decodeURIComponent(urlPath.slice("/api/bookings/".length));
      const booking = (db.hotelBookings || []).find((item) => item.id === id);
      db.hotelBookings = (db.hotelBookings || []).filter((item) => item.id !== id);
      db.settings = db.settings || {};
      db.settings.deletedSeedBookings = Array.isArray(db.settings.deletedSeedBookings) ? db.settings.deletedSeedBookings : [];
      if (!booking && !db.settings.deletedSeedBookings.includes(id)) {
        db.settings.deletedSeedBookings.push(id);
      }
      db.auditLogs = Array.isArray(db.auditLogs) ? db.auditLogs : [];
      db.auditLogs.unshift({
        id: `LOG-${Date.now()}`,
        user: user.name,
        role: user.role,
        action: "Xóa đặt phòng",
        record: booking?.group || id,
        before: booking ? "Đã tồn tại" : "Đặt phòng mẫu",
        after: "Đã xóa",
        createdAt: new Date().toISOString()
      });
      const saved = await writeDb(db, record.version);
      sendJson(res, 200, { ok: true, deletedId: id, version: saved.version, updatedAt: saved.updatedAt });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message });
    }
    return true;
  }

  if (urlPath === "/api/data" && req.method === "PUT") {
    try {
      const body = await readBody(req);
      if (!body || typeof body.db !== "object") {
        sendJson(res, 400, { ok: false, message: "Dữ liệu không hợp lệ." });
        return true;
      }
      const currentRecord = await readDbRecord();
      const currentUser = (currentRecord.db.users || []).find((item) => item.id === session.userId && item.active);
      if (!currentUser) {
        sendJson(res, 401, { ok: false, message: "Phiên đăng nhập không hợp lệ." });
        return true;
      }
      const currentMarketingAssets = Array.isArray(currentRecord.db.marketingAssets) ? currentRecord.db.marketingAssets : [];
      const nextMarketingAssets = Array.isArray(body.db.marketingAssets) ? body.db.marketingAssets : [];
      const marketingChanged = JSON.stringify(currentMarketingAssets) !== JSON.stringify(nextMarketingAssets);
      const userPermissions = Array.isArray(currentUser.permissions) ? currentUser.permissions : [];
      if (marketingChanged && currentUser.role !== "admin" && !userPermissions.includes("marketing_manage")) {
        sendJson(res, 403, { ok: false, message: "Tài khoản này chỉ được xem, không có quyền thay đổi dữ liệu Marketing dùng chung." });
        return true;
      }
      const baseVersion = Number(body.baseVersion);
      const saved = await writeDb(body.db, Number.isInteger(baseVersion) ? baseVersion : null);
      sendJson(res, 200, {
        ok: true,
        savedAt: new Date().toISOString(),
        version: saved.version,
        updatedAt: saved.updatedAt
      });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message });
    }
    return true;
  }

  sendJson(res, 404, { ok: false, message: "API not found." });
  return true;
}

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath.startsWith("/uploads/db/")) {
    await serveDatabaseUpload(req, res, urlPath);
    return;
  }

  if (urlPath.startsWith("/api/")) {
    await handleApi(req, res, urlPath);
    return;
  }

  const safePath = path.normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(root, "index.html"), (fallbackErr, fallback) => {
        if (fallbackErr) {
          res.writeHead(404);
          res.end("Not found");
          return;
        }
        sendStatic(req, res, path.join(root, "index.html"), fallback);
      });
      return;
    }
    sendStatic(req, res, filePath, data);
  });
});

server.listen(port, host, () => {
  console.log(`COCO BAY app running on ${host}:${port} (${pool ? "MySQL mode" : "localStorage mode"})`);
});
