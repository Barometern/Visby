import { createServer } from "node:http";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import {
  addScanForUser,
  createLocation,
  createUser,
  deleteLocation,
  deleteSession,
  ensureAdminUser,
  getLocationById,
  getLocationByQrCode,
  getUserByEmail,
  getUserBySessionId,
  initDb,
  listLocations,
  seedLocations,
  setUserPaid,
  startSessionPurgeInterval,
  updateLocation,
  upsertSession,
} from "./lib/db.mjs";
import { loadBundledLocations } from "./lib/default-locations.mjs";
import { logError, logInfo, logWarn } from "./lib/logger.mjs";
import { validateAuthPayload, validateLocationPayload } from "./lib/validation.mjs";

const PORT = Number(process.env.PORT || 8787);
const SESSION_COOKIE = "visbyquest_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const AUTH_RATE_LIMIT_WINDOW_MS = 1000 * 60 * 15;
const AUTH_RATE_LIMIT_MAX_ATTEMPTS = 10;
const SCAN_RATE_LIMIT_WINDOW_MS = 1000 * 60;
const SCAN_RATE_LIMIT_MAX_ATTEMPTS = 30;
const IS_PROD = process.env.NODE_ENV === "production";
const ADMIN_ENABLED = !IS_PROD || process.env.ENABLE_ADMIN === "true";
const ADMIN_BOOTSTRAP_EMAIL = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase() || "";
const ADMIN_BOOTSTRAP_PASSWORD = process.env.ADMIN_BOOTSTRAP_PASSWORD || "";
const DIST_DIR = path.resolve(process.cwd(), "dist");

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const authAttempts = new Map();
const scanAttempts = new Map();

class RequestError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "RequestError";
    this.statusCode = statusCode;
  }
}

await initDb();
startSessionPurgeInterval();

try {
  if ((await listLocations()).length === 0) {
    const bundledLocations = loadBundledLocations();
    const seededLocations = await seedLocations(bundledLocations);
    logInfo("locations.seeded", { count: seededLocations.length });
  }
} catch (error) {
  logError("locations.seed_failed", {
    message: error instanceof Error ? error.message : "Unknown seed error",
  });
}

try {
  if (ADMIN_BOOTSTRAP_EMAIL && ADMIN_BOOTSTRAP_PASSWORD) {
    const existingAdmin = await getUserByEmail(ADMIN_BOOTSTRAP_EMAIL);
    const needsUpdate = !existingAdmin ||
      !verifyPassword(ADMIN_BOOTSTRAP_PASSWORD, existingAdmin.passwordHash) ||
      !existingAdmin.isAdmin;
    if (needsUpdate) {
      await ensureAdminUser({
        email: ADMIN_BOOTSTRAP_EMAIL,
        passwordHash: hashPassword(ADMIN_BOOTSTRAP_PASSWORD),
      });
      logInfo("admin.bootstrapped", { email: ADMIN_BOOTSTRAP_EMAIL });
    }
  }
} catch (error) {
  logError("admin.bootstrap_failed", {
    message: error instanceof Error ? error.message : "Unknown admin bootstrap error",
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function sendError(res, statusCode, error, context = {}) {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  const details = { statusCode, error, ...context };

  if (level === "error") {
    logError("request.failed", details);
  } else {
    logWarn("request.rejected", details);
  }

  sendJson(res, statusCode, { error });
}

async function parseJsonBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString("utf8");

  try {
    return JSON.parse(raw);
  } catch {
    throw new RequestError(400, "Invalid JSON body.");
  }
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice("Bearer ".length);
}

function parseCookies(req) {
  const raw = req.headers.cookie;
  if (!raw) return {};

  return raw.split(";").reduce((cookies, part) => {
    const [key, ...rest] = part.trim().split("=");
    cookies[key] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
}

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.socket.remoteAddress || "unknown";
}

function getAuthRateLimitKey(req, email = "") {
  return `${getClientIp(req)}:${email.trim().toLowerCase()}`;
}

function clearExpiredAuthAttempts(now = Date.now()) {
  for (const [key, entry] of authAttempts.entries()) {
    if (entry.resetAt <= now) {
      authAttempts.delete(key);
    }
  }
}

function getRetryAfterSeconds(resetAt, now = Date.now()) {
  return Math.max(1, Math.ceil((resetAt - now) / 1000));
}

function enforceAuthRateLimit(req, res, email = "") {
  const now = Date.now();
  clearExpiredAuthAttempts(now);

  const key = getAuthRateLimitKey(req, email);
  const entry = authAttempts.get(key);

  if (!entry || entry.resetAt <= now) {
    return true;
  }

  if (entry.attempts < AUTH_RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  const retryAfterSeconds = getRetryAfterSeconds(entry.resetAt, now);
  res.setHeader("Retry-After", String(retryAfterSeconds));
  sendError(res, 429, "Too many authentication attempts. Please try again later.", {
    path: req.url,
    retryAfterSeconds,
    ip: getClientIp(req),
    email: email.trim().toLowerCase(),
  });
  return false;
}

function recordAuthAttempt(req, email = "") {
  const now = Date.now();
  const key = getAuthRateLimitKey(req, email);
  const entry = authAttempts.get(key);

  if (!entry || entry.resetAt <= now) {
    authAttempts.set(key, {
      attempts: 1,
      resetAt: now + AUTH_RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  entry.attempts += 1;
}

function clearAuthAttempts(req, email = "") {
  authAttempts.delete(getAuthRateLimitKey(req, email));
}

function enforceScanRateLimit(req, res) {
  const now = Date.now();
  const ip = getClientIp(req);

  for (const [key, entry] of scanAttempts.entries()) {
    if (entry.resetAt <= now) scanAttempts.delete(key);
  }

  const entry = scanAttempts.get(ip);

  if (!entry || entry.resetAt <= now) {
    scanAttempts.set(ip, { attempts: 1, resetAt: now + SCAN_RATE_LIMIT_WINDOW_MS });
    return true;
  }

  entry.attempts += 1;

  if (entry.attempts <= SCAN_RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  res.setHeader("Retry-After", String(retryAfterSeconds));
  sendError(res, 429, "Too many scan attempts. Please try again later.", {
    path: req.url,
    retryAfterSeconds,
    ip,
  });
  return false;
}

function sessionCookieHeader(sessionId, maxAgeSeconds = SESSION_TTL_MS / 1000) {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (IS_PROD) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function clearSessionCookieHeader() {
  const parts = [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (IS_PROD) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function sendJsonWithCookie(res, statusCode, payload, cookieHeader) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Set-Cookie": cookieHeader,
  });
  res.end(JSON.stringify(payload));
}

function resolveStaticPath(requestPath) {
  const normalizedPath = decodeURIComponent(requestPath === "/" ? "/index.html" : requestPath);
  const relativePath = normalizedPath.replace(/^\/+/, "");
  const absolutePath = path.resolve(DIST_DIR, relativePath);

  if (!absolutePath.startsWith(DIST_DIR)) {
    return null;
  }

  return absolutePath;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";
  const cacheControl =
    filePath.endsWith("index.html")
      ? "no-cache"
      : "public, max-age=31536000, immutable";

  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": cacheControl,
  });
  const stream = createReadStream(filePath);
  stream.on("error", () => {
    if (!res.writableEnded) res.end();
  });
  stream.pipe(res);
}

function tryServeFrontend(res, requestPath) {
  if (!existsSync(DIST_DIR)) {
    return false;
  }

  const assetPath = resolveStaticPath(requestPath);
  if (assetPath && existsSync(assetPath)) {
    sendFile(res, assetPath);
    return true;
  }

  const fallbackPath = path.join(DIST_DIR, "index.html");
  if (!existsSync(fallbackPath)) {
    return false;
  }

  sendFile(res, fallbackPath);
  return true;
}

function hashPassword(password, salt = randomBytes(16).toString("hex")) {
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const incomingHash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(hash, "hex");

  if (incomingHash.length !== storedBuffer.length) return false;
  return timingSafeEqual(incomingHash, storedBuffer);
}

function sanitizeLocation(location) {
  return {
    id: location.id,
    qrCode: location.qrCode,
    name: location.name,
    description: location.description,
    readMore: location.readMore,
    clue: location.clue,
    coordinates: location.coordinates,
    googleMapsUrl: location.googleMapsUrl,
    images: location.images,
    scanCount: location.scanCount,
  };
}

function sanitizeUser(user) {
  return {
    email: user.email,
    isAdmin: user.isAdmin,
    hasPaid: user.hasPaid,
    scannedLocations: user.scannedLocations,
  };
}

async function requireUser(req) {
  const cookies = parseCookies(req);
  const sessionId = cookies[SESSION_COOKIE] || getBearerToken(req);
  if (!sessionId) return { error: "Missing session." };

  const user = await getUserBySessionId(sessionId);

  if (!user) {
    return { error: "Session not found." };
  }

  return { user, sessionId };
}

async function requireAdmin(req) {
  if (!ADMIN_ENABLED) {
    return { error: "Admin mode is disabled in this environment.", statusCode: 404 };
  }

  const result = await requireUser(req);

  if ("error" in result) {
    return result;
  }

  if (!result.user.isAdmin) {
    return { error: "Admin access required.", statusCode: 403 };
  }

  return result;
}

const server = createServer(async (req, res) => {
  try {
    if (!req.url) {
      sendJson(res, 400, { error: "Missing request URL." });
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/signup") {
      const validation = validateAuthPayload(await parseJsonBody(req), "signup");
      if (!validation.ok) {
        sendError(res, 400, validation.error, { path: url.pathname });
        return;
      }
      const { email, password } = validation.value;

      if (!enforceAuthRateLimit(req, res, email)) {
        return;
      }

      const existingUser = await getUserByEmail(email);

      if (existingUser) {
        recordAuthAttempt(req, email);
        sendError(res, 409, "A user with that email already exists.", { path: url.pathname, email });
        return;
      }

      const sessionId = randomUUID();
      const user = await createUser({
        email,
        passwordHash: hashPassword(password),
        isAdmin: false,
      });
      await upsertSession({
        id: sessionId,
        userEmail: user.email,
        expiresAt: Date.now() + SESSION_TTL_MS,
      });

      sendJsonWithCookie(
        res,
        201,
        { user: sanitizeUser(user) },
        sessionCookieHeader(sessionId),
      );
      clearAuthAttempts(req, email);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const validation = validateAuthPayload(await parseJsonBody(req), "login");
      if (!validation.ok) {
        sendError(res, 400, validation.error, { path: url.pathname });
        return;
      }
      const { email, password } = validation.value;

      if (!enforceAuthRateLimit(req, res, email)) {
        return;
      }

      const user = await getUserByEmail(email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        recordAuthAttempt(req, email);
        sendError(res, 401, "Invalid email or password.", { path: url.pathname, email });
        return;
      }

      const sessionId = randomUUID();
      await upsertSession({
        id: sessionId,
        userEmail: user.email,
        expiresAt: Date.now() + SESSION_TTL_MS,
      });

      sendJsonWithCookie(
        res,
        200,
        { user: sanitizeUser(user) },
        sessionCookieHeader(sessionId),
      );
      clearAuthAttempts(req, email);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      const result = await requireUser(req);

      if ("error" in result) {
        sendError(res, 401, result.error, { path: url.pathname });
        return;
      }

      await deleteSession(result.sessionId);

      sendJsonWithCookie(res, 200, { ok: true }, clearSessionCookieHeader());
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/me") {
      const result = await requireUser(req);

      if ("error" in result) {
        sendError(res, 401, result.error, { path: url.pathname });
        return;
      }

      sendJson(res, 200, { user: sanitizeUser(result.user) });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/locations") {
      sendJson(res, 200, { locations: (await listLocations()).map(sanitizeLocation) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/bootstrap/locations") {
      const result = await requireAdmin(req);

      if ("error" in result) {
        sendError(res, result.statusCode || 401, result.error, { path: url.pathname });
        return;
      }

      const { locations } = await parseJsonBody(req);

      if (!Array.isArray(locations)) {
        sendError(res, 400, "locations must be an array.", { path: url.pathname });
        return;
      }

      for (const location of locations) {
        const validation = validateLocationPayload(location);
        if (!validation.ok) {
          sendError(res, 400, validation.error, { path: url.pathname, locationId: location?.id });
          return;
        }
      }

      sendJson(res, 200, { locations: (await seedLocations(locations)).map(sanitizeLocation) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/payments/mock-checkout") {
      const result = await requireUser(req);

      if ("error" in result) {
        sendError(res, 401, result.error, { path: url.pathname });
        return;
      }

      const updatedUser = await setUserPaid(result.user.email);

      sendJson(res, 200, { user: sanitizeUser(updatedUser) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/progress/scan") {
      if (!enforceScanRateLimit(req, res)) return;

      const result = await requireUser(req);

      if ("error" in result) {
        sendError(res, 401, "Please log in before scanning QR codes.", { path: url.pathname });
        return;
      }

      const { locationId } = await parseJsonBody(req);

      if (!locationId) {
        sendError(res, 400, "The QR code could not be matched to a location.", { path: url.pathname });
        return;
      }

      if (!result.user.hasPaid && result.user.scannedLocations.length >= 2) {
        sendError(res, 402, "You have used the free scans for this account.", {
          path: url.pathname,
          email: result.user.email,
        });
        return;
      }

      if (!(await getLocationById(locationId))) {
        sendError(res, 404, "This QR code points to a location that is not available.", {
          path: url.pathname,
          locationId,
        });
        return;
      }

      const scanResult = await addScanForUser(result.user.email, locationId);

      sendJson(res, 200, {
        alreadyScanned: scanResult.alreadyScanned,
        user: sanitizeUser(scanResult.user),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/locations") {
      const result = await requireAdmin(req);

      if ("error" in result) {
        sendError(res, result.statusCode || 401, result.error, { path: url.pathname });
        return;
      }

      const { location } = await parseJsonBody(req);
      const validation = validateLocationPayload(location);

      if (!validation.ok) {
        sendError(res, 400, validation.error, { path: url.pathname, email: result.user.email });
        return;
      }

      const existingQrLocation = await getLocationByQrCode(validation.value.qrCode);
      if (existingQrLocation) {
        sendError(res, 409, "A location with that QR code already exists.", {
          path: url.pathname,
          email: result.user.email,
          qrCode: validation.value.qrCode,
        });
        return;
      }

      const createdLocation = await createLocation(validation.value);

      sendJson(res, 201, { location: sanitizeLocation(createdLocation) });
      return;
    }

    if (req.method === "PUT" && url.pathname.startsWith("/api/admin/locations/")) {
      const result = await requireAdmin(req);

      if ("error" in result) {
        sendError(res, result.statusCode || 401, result.error, { path: url.pathname });
        return;
      }

      const locationId = decodeURIComponent(url.pathname.split("/").pop() || "");
      const { location } = await parseJsonBody(req);
      const validation = validateLocationPayload(location);

      if (!(await getLocationById(locationId))) {
        sendError(res, 404, "Location not found.", { path: url.pathname, locationId });
        return;
      }

      if (!validation.ok) {
        sendError(res, 400, validation.error, { path: url.pathname, locationId, email: result.user.email });
        return;
      }

      const existingQrLocation = await getLocationByQrCode(validation.value.qrCode);
      if (existingQrLocation && existingQrLocation.id !== locationId) {
        sendError(res, 409, "A location with that QR code already exists.", {
          path: url.pathname,
          locationId,
          email: result.user.email,
          qrCode: validation.value.qrCode,
        });
        return;
      }

      const updatedLocation = await updateLocation(locationId, validation.value);

      sendJson(res, 200, { location: sanitizeLocation(updatedLocation) });
      return;
    }

    if (req.method === "DELETE" && url.pathname.startsWith("/api/admin/locations/")) {
      const result = await requireAdmin(req);

      if ("error" in result) {
        sendError(res, result.statusCode || 401, result.error, { path: url.pathname });
        return;
      }

      const locationId = decodeURIComponent(url.pathname.split("/").pop() || "");
      await deleteLocation(locationId);

      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && !url.pathname.startsWith("/api/")) {
      if (tryServeFrontend(res, url.pathname)) {
        return;
      }
    }

    sendError(res, 404, "Not found.", { path: url.pathname, method: req.method });
  } catch (error) {
    if (error instanceof RequestError) {
      sendError(res, error.statusCode, error.message, {
        path: req.url,
      });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown server error.";
    sendError(res, 500, "The server hit an unexpected error. Please try again.", {
      path: req.url,
      message,
    });
  }
});

server.listen(PORT, () => {
  logInfo("server.started", {
    port: PORT,
    adminEnabled: ADMIN_ENABLED,
    environment: process.env.NODE_ENV || "development",
  });
});
