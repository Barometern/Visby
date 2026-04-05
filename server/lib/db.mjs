import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), "server/data");
const DB_PATH = path.join(DATA_DIR, "visby-quest.sqlite");
const LEGACY_JSON_PATH = path.join(DATA_DIR, "db.json");

mkdirSync(DATA_DIR, { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    is_admin INTEGER NOT NULL DEFAULT 0,
    has_paid INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS locations (
    id TEXT PRIMARY KEY,
    qr_code TEXT NOT NULL,
    name_json TEXT NOT NULL,
    description_json TEXT NOT NULL,
    read_more_json TEXT NOT NULL,
    clue_json TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    google_maps_url TEXT NOT NULL,
    images_json TEXT NOT NULL,
    scan_count INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS scans (
    user_email TEXT NOT NULL,
    location_id TEXT NOT NULL,
    scanned_at INTEGER NOT NULL,
    PRIMARY KEY (user_email, location_id),
    FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_locations_qr_code
  ON locations(qr_code);
`);

function runInTransaction(work) {
  db.exec("BEGIN IMMEDIATE");

  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // Ignore rollback failures so we don't mask the original error.
    }
    throw error;
  }
}

function migrateLegacyJsonIfNeeded() {
  const userCount = db.prepare(`SELECT COUNT(*) AS count FROM users`).get().count;
  const locationCount = db.prepare(`SELECT COUNT(*) AS count FROM locations`).get().count;

  if ((userCount > 0 || locationCount > 0) || !existsSync(LEGACY_JSON_PATH)) {
    return;
  }

  const legacy = JSON.parse(readFileSync(LEGACY_JSON_PATH, "utf8"));

  const insertUser = db.prepare(
    `
      INSERT INTO users (email, password_hash, is_admin, has_paid)
      VALUES (?, ?, ?, ?)
    `,
  );
  const insertSession = db.prepare(
    `
      INSERT INTO sessions (id, user_email, expires_at)
      VALUES (?, ?, ?)
    `,
  );
  const insertLocation = db.prepare(
    `
      INSERT INTO locations (
        id,
        qr_code,
        name_json,
        description_json,
        read_more_json,
        clue_json,
        latitude,
        longitude,
        google_maps_url,
        images_json,
        scan_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );
  const insertScan = db.prepare(
    `
      INSERT OR IGNORE INTO scans (user_email, location_id, scanned_at)
      VALUES (?, ?, ?)
    `,
  );

  runInTransaction(() => {
    for (const location of legacy.locations ?? []) {
      insertLocation.run(
        location.id,
        location.qrCode,
        JSON.stringify(location.name),
        JSON.stringify(location.description),
        JSON.stringify(location.readMore),
        JSON.stringify(location.clue),
        location.coordinates.lat,
        location.coordinates.lng,
        location.googleMapsUrl,
        JSON.stringify(location.images ?? []),
        location.scanCount ?? 0,
      );
    }

    for (const user of legacy.users ?? []) {
      insertUser.run(
        user.email,
        user.passwordHash ?? user.password ?? "",
        user.isAdmin ? 1 : 0,
        user.hasPaid ? 1 : 0,
      );

      if (user.sessionToken) {
        insertSession.run(
          user.sessionToken,
          user.email,
          Date.now() + 1000 * 60 * 60 * 24 * 7,
        );
      }

      for (const locationId of user.scannedLocations ?? []) {
        insertScan.run(user.email, locationId, Date.now());
      }
    }
  });
}

migrateLegacyJsonIfNeeded();

function parseLocation(row) {
  if (!row) return null;

  return {
    id: row.id,
    qrCode: row.qr_code,
    name: JSON.parse(row.name_json),
    description: JSON.parse(row.description_json),
    readMore: JSON.parse(row.read_more_json),
    clue: JSON.parse(row.clue_json),
    coordinates: {
      lat: row.latitude,
      lng: row.longitude,
    },
    googleMapsUrl: row.google_maps_url,
    images: JSON.parse(row.images_json),
    scanCount: row.scan_count,
  };
}

function parseUser(row, scannedLocations = []) {
  if (!row) return null;

  return {
    email: row.email,
    passwordHash: row.password_hash,
    isAdmin: Boolean(row.is_admin),
    hasPaid: Boolean(row.has_paid),
    scannedLocations,
  };
}

function listScannedLocationsForUser(email) {
  return db
    .prepare(
      `
        SELECT location_id
        FROM scans
        WHERE user_email = ?
        ORDER BY scanned_at ASC
      `,
    )
    .all(email)
    .map((row) => row.location_id);
}

export function getUserByEmail(email) {
  const row = db
    .prepare(
      `
        SELECT email, password_hash, is_admin, has_paid
        FROM users
        WHERE email = ?
      `,
    )
    .get(email);

  if (!row) return null;
  return parseUser(row, listScannedLocationsForUser(email));
}

export function createUser({ email, passwordHash, isAdmin }) {
  db.prepare(
    `
      INSERT INTO users (email, password_hash, is_admin, has_paid)
      VALUES (?, ?, ?, 0)
    `,
  ).run(email, passwordHash, isAdmin ? 1 : 0);

  return getUserByEmail(email);
}

export function upsertSession({ id, userEmail, expiresAt }) {
  db.prepare(`DELETE FROM sessions WHERE user_email = ?`).run(userEmail);
  db.prepare(
    `
      INSERT INTO sessions (id, user_email, expires_at)
      VALUES (?, ?, ?)
    `,
  ).run(id, userEmail, expiresAt);
}

export function deleteSession(sessionId) {
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(sessionId);
}

export function purgeExpiredSessions(now = Date.now()) {
  db.prepare(`DELETE FROM sessions WHERE expires_at <= ?`).run(now);
}

export function getUserBySessionId(sessionId) {
  purgeExpiredSessions();

  const row = db
    .prepare(
      `
        SELECT u.email, u.password_hash, u.is_admin, u.has_paid
        FROM sessions s
        JOIN users u ON u.email = s.user_email
        WHERE s.id = ?
      `,
    )
    .get(sessionId);

  if (!row) return null;
  return parseUser(row, listScannedLocationsForUser(row.email));
}

export function listLocations() {
  return db
    .prepare(
      `
        SELECT *
        FROM locations
        ORDER BY rowid ASC
      `,
    )
    .all()
    .map(parseLocation);
}

export function seedLocations(locations) {
  const countRow = db.prepare(`SELECT COUNT(*) AS count FROM locations`).get();
  if (countRow.count > 0) {
    return listLocations();
  }

  const insert = db.prepare(
    `
      INSERT INTO locations (
        id,
        qr_code,
        name_json,
        description_json,
        read_more_json,
        clue_json,
        latitude,
        longitude,
        google_maps_url,
        images_json,
        scan_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  );

  runInTransaction(() => {
    for (const location of locations) {
      insert.run(
        location.id,
        location.qrCode,
        JSON.stringify(location.name),
        JSON.stringify(location.description),
        JSON.stringify(location.readMore),
        JSON.stringify(location.clue),
        location.coordinates.lat,
        location.coordinates.lng,
        location.googleMapsUrl,
        JSON.stringify(location.images ?? []),
        location.scanCount ?? 0,
      );
    }
  });
  return listLocations();
}

export function createLocation(location) {
  db.prepare(
    `
      INSERT INTO locations (
        id,
        qr_code,
        name_json,
        description_json,
        read_more_json,
        clue_json,
        latitude,
        longitude,
        google_maps_url,
        images_json,
        scan_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    location.id,
    location.qrCode,
    JSON.stringify(location.name),
    JSON.stringify(location.description),
    JSON.stringify(location.readMore),
    JSON.stringify(location.clue),
    location.coordinates.lat,
    location.coordinates.lng,
    location.googleMapsUrl,
    JSON.stringify(location.images ?? []),
    location.scanCount ?? 0,
  );

  return getLocationById(location.id);
}

export function updateLocation(locationId, location) {
  db.prepare(
    `
      UPDATE locations
      SET
        qr_code = ?,
        name_json = ?,
        description_json = ?,
        read_more_json = ?,
        clue_json = ?,
        latitude = ?,
        longitude = ?,
        google_maps_url = ?,
        images_json = ?,
        scan_count = ?
      WHERE id = ?
    `,
  ).run(
    location.qrCode,
    JSON.stringify(location.name),
    JSON.stringify(location.description),
    JSON.stringify(location.readMore),
    JSON.stringify(location.clue),
    location.coordinates.lat,
    location.coordinates.lng,
    location.googleMapsUrl,
    JSON.stringify(location.images ?? []),
    location.scanCount ?? 0,
    locationId,
  );

  return getLocationById(locationId);
}

export function deleteLocation(locationId) {
  db.prepare(`DELETE FROM locations WHERE id = ?`).run(locationId);
}

export function getLocationById(locationId) {
  const row = db.prepare(`SELECT * FROM locations WHERE id = ?`).get(locationId);
  return parseLocation(row);
}

export function getLocationByQrCode(qrCode) {
  const row = db.prepare(`SELECT * FROM locations WHERE qr_code = ?`).get(qrCode);
  return parseLocation(row);
}

export function setUserPaid(email) {
  db.prepare(`UPDATE users SET has_paid = 1 WHERE email = ?`).run(email);
  return getUserByEmail(email);
}

export function ensureAdminUser({ email, passwordHash }) {
  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return createUser({ email, passwordHash, isAdmin: true });
  }

  db.prepare(
    `
      UPDATE users
      SET is_admin = 1,
          password_hash = ?
      WHERE email = ?
    `,
  ).run(passwordHash, email);

  return getUserByEmail(email);
}

export function addScanForUser(email, locationId) {
  const existing = db
    .prepare(
      `
        SELECT 1
        FROM scans
        WHERE user_email = ? AND location_id = ?
      `,
    )
    .get(email, locationId);

  if (existing) {
    return { alreadyScanned: true, user: getUserByEmail(email) };
  }

  runInTransaction(() => {
    db.prepare(
      `
        INSERT INTO scans (user_email, location_id, scanned_at)
        VALUES (?, ?, ?)
      `,
    ).run(email, locationId, Date.now());

    db.prepare(
      `
        UPDATE locations
        SET scan_count = scan_count + 1
        WHERE id = ?
      `,
    ).run(locationId);
  });

  return {
    alreadyScanned: false,
    user: getUserByEmail(email),
  };
}
