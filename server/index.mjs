import { createServer } from "node:http";
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import {
  addScanForUser,
  createLocation,
  createUser,
  deleteLocation,
  deleteSession,
  getLocationById,
  getUserByEmail,
  getUserBySessionId,
  listLocations,
  seedLocations,
  setUserPaid,
  updateLocation,
  upsertSession,
} from "./lib/db.mjs";
import { loadBundledLocations } from "./lib/default-locations.mjs";
import { logError, logInfo, logWarn } from "./lib/logger.mjs";
import { validateAuthPayload, validateLocationPayload } from "./lib/validation.mjs";

const PORT = Number(process.env.PORT || 8787);
const ADMIN_EMAIL = "admin@visbyquest.com";
const SESSION_COOKIE = "visbyquest_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const IS_PROD = process.env.NODE_ENV === "production";
const ADMIN_ENABLED = !IS_PROD || process.env.ENABLE_ADMIN === "true";

try {
  if (listLocations().length === 0) {
    const bundledLocations = loadBundledLocations();
    const seededLocations = seedLocations(bundledLocations);
    logInfo("locations.seeded", { count: seededLocations.length });
  }
} catch (error) {
  logError("locations.seed_failed", {
    message: error instanceof Error ? error.message : "Unknown seed error",
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
  return JSON.parse(raw);
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

  const user = getUserBySessionId(sessionId);

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

      const existingUser = getUserByEmail(email);

      if (existingUser) {
        sendError(res, 409, "A user with that email already exists.", { path: url.pathname, email });
        return;
      }

      const sessionId = randomUUID();
      const user = createUser({
        email,
        passwordHash: hashPassword(password),
        isAdmin: email === ADMIN_EMAIL,
      });
      upsertSession({
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
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const validation = validateAuthPayload(await parseJsonBody(req), "login");
      if (!validation.ok) {
        sendError(res, 400, validation.error, { path: url.pathname });
        return;
      }
      const { email, password } = validation.value;

      const user = getUserByEmail(email);

      if (!user || !verifyPassword(password, user.passwordHash)) {
        sendError(res, 401, "Invalid email or password.", { path: url.pathname, email });
        return;
      }

      const sessionId = randomUUID();
      upsertSession({
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
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/auth/logout") {
      const result = await requireUser(req);

      if ("error" in result) {
        sendError(res, 401, result.error, { path: url.pathname });
        return;
      }

      deleteSession(result.sessionId);

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
      sendJson(res, 200, { locations: listLocations().map(sanitizeLocation) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/bootstrap/locations") {
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

      sendJson(res, 200, { locations: seedLocations(locations).map(sanitizeLocation) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/payments/mock-checkout") {
      const result = await requireUser(req);

      if ("error" in result) {
        sendError(res, 401, result.error, { path: url.pathname });
        return;
      }

      const updatedUser = setUserPaid(result.user.email);

      sendJson(res, 200, { user: sanitizeUser(updatedUser) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/progress/scan") {
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

      if (!getLocationById(locationId)) {
        sendError(res, 404, "This QR code points to a location that is not available.", {
          path: url.pathname,
          locationId,
        });
        return;
      }

      const scanResult = addScanForUser(result.user.email, locationId);

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

      const createdLocation = createLocation(validation.value);

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

      if (!getLocationById(locationId)) {
        sendError(res, 404, "Location not found.", { path: url.pathname, locationId });
        return;
      }

      if (!validation.ok) {
        sendError(res, 400, validation.error, { path: url.pathname, locationId, email: result.user.email });
        return;
      }

      const updatedLocation = updateLocation(locationId, validation.value);

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
      deleteLocation(locationId);

      sendJson(res, 200, { ok: true });
      return;
    }

    sendError(res, 404, "Not found.", { path: url.pathname, method: req.method });
  } catch (error) {
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
