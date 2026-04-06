import "dotenv/config";
import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required for the Postgres-backed server.");
}

const isRailwayInternal = DATABASE_URL.includes("railway.internal");
const pgSslMode =
  process.env.PGSSL_MODE ||
  (isRailwayInternal ? "disable" : process.env.NODE_ENV === "production" ? "require" : "disable");
const allowInsecurePgSsl = process.env.PGSSL_INSECURE_SKIP_VERIFY === "true";

let ssl = false;

if (pgSslMode === "require") {
  ssl = allowInsecurePgSsl ? { rejectUnauthorized: false } : { rejectUnauthorized: true };
} else if (pgSslMode !== "disable") {
  throw new Error(`Unsupported PGSSL_MODE: ${pgSslMode}`);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl,
});

function parseLocation(row) {
  if (!row) return null;

  return {
    id: row.id,
    qrCode: row.qr_code,
    name: row.name_json,
    description: row.description_json,
    readMore: row.read_more_json,
    clue: row.clue_json,
    coordinates: {
      lat: Number(row.latitude),
      lng: Number(row.longitude),
    },
    googleMapsUrl: row.google_maps_url,
    images: row.images_json,
    scanCount: Number(row.scan_count),
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

async function query(text, params = []) {
  return pool.query(text, params);
}

async function runInTransaction(work) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback failures so we don't mask the original error.
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      email TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      has_paid BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      expires_at BIGINT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      qr_code TEXT NOT NULL UNIQUE,
      name_json JSONB NOT NULL,
      description_json JSONB NOT NULL,
      read_more_json JSONB NOT NULL,
      clue_json JSONB NOT NULL,
      latitude DOUBLE PRECISION NOT NULL,
      longitude DOUBLE PRECISION NOT NULL,
      google_maps_url TEXT NOT NULL,
      images_json JSONB NOT NULL,
      scan_count INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS scans (
      user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
      location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      scanned_at BIGINT NOT NULL,
      PRIMARY KEY (user_email, location_id)
    );
  `);
}

async function listScannedLocationsForUser(email) {
  const result = await query(
    `
      SELECT location_id
      FROM scans
      WHERE user_email = $1
      ORDER BY scanned_at ASC
    `,
    [email],
  );

  return result.rows.map((row) => row.location_id);
}

export async function getUserByEmail(email) {
  const result = await query(
    `
      SELECT email, password_hash, is_admin, has_paid
      FROM users
      WHERE email = $1
    `,
    [email],
  );

  const row = result.rows[0];
  if (!row) return null;

  return parseUser(row, await listScannedLocationsForUser(email));
}

export async function createUser({ email, passwordHash, isAdmin }) {
  await query(
    `
      INSERT INTO users (email, password_hash, is_admin, has_paid)
      VALUES ($1, $2, $3, FALSE)
    `,
    [email, passwordHash, Boolean(isAdmin)],
  );

  return getUserByEmail(email);
}

export async function upsertSession({ id, userEmail, expiresAt }) {
  await runInTransaction(async (client) => {
    await client.query(`DELETE FROM sessions WHERE user_email = $1`, [userEmail]);
    await client.query(
      `
        INSERT INTO sessions (id, user_email, expires_at)
        VALUES ($1, $2, $3)
      `,
      [id, userEmail, expiresAt],
    );
  });
}

export async function deleteSession(sessionId) {
  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export async function purgeExpiredSessions(now = Date.now()) {
  await query(`DELETE FROM sessions WHERE expires_at <= $1`, [now]);
}

export async function getUserBySessionId(sessionId) {
  const result = await query(
    `
      SELECT u.email, u.password_hash, u.is_admin, u.has_paid
      FROM sessions s
      JOIN users u ON u.email = s.user_email
      WHERE s.id = $1
        AND s.expires_at > $2
    `,
    [sessionId, Date.now()],
  );

  const row = result.rows[0];
  if (!row) return null;

  return parseUser(row, await listScannedLocationsForUser(row.email));
}

export function startSessionPurgeInterval(intervalMs = 5 * 60 * 1000) {
  return setInterval(() => {
    purgeExpiredSessions().catch((err) => {
      console.error("Session purge failed:", err);
    });
  }, intervalMs);
}

export async function listLocations() {
  const result = await query(
    `
      SELECT *
      FROM locations
      ORDER BY created_at ASC, id ASC
    `,
  );

  return result.rows.map(parseLocation);
}

export async function seedLocations(locations) {
  const countResult = await query(`SELECT COUNT(*)::int AS count FROM locations`);
  if (countResult.rows[0].count > 0) {
    return listLocations();
  }

  await runInTransaction(async (client) => {
    for (const location of locations) {
      await client.query(
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
          ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10::jsonb, $11)
        `,
        [
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
        ],
      );
    }
  });

  return listLocations();
}

export async function createLocation(location) {
  await query(
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
      ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6::jsonb, $7, $8, $9, $10::jsonb, $11)
    `,
    [
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
    ],
  );

  return getLocationById(location.id);
}

export async function updateLocation(locationId, location) {
  await query(
    `
      UPDATE locations
      SET
        qr_code = $1,
        name_json = $2::jsonb,
        description_json = $3::jsonb,
        read_more_json = $4::jsonb,
        clue_json = $5::jsonb,
        latitude = $6,
        longitude = $7,
        google_maps_url = $8,
        images_json = $9::jsonb,
        scan_count = $10
      WHERE id = $11
    `,
    [
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
    ],
  );

  return getLocationById(locationId);
}

export async function deleteLocation(locationId) {
  await query(`DELETE FROM locations WHERE id = $1`, [locationId]);
}

export async function getLocationById(locationId) {
  const result = await query(`SELECT * FROM locations WHERE id = $1`, [locationId]);
  return parseLocation(result.rows[0]);
}

export async function getLocationByQrCode(qrCode) {
  const result = await query(`SELECT * FROM locations WHERE qr_code = $1`, [qrCode]);
  return parseLocation(result.rows[0]);
}

export async function setUserPaid(email) {
  await query(`UPDATE users SET has_paid = TRUE WHERE email = $1`, [email]);
  return getUserByEmail(email);
}

export async function ensureAdminUser({ email, passwordHash }) {
  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return createUser({ email, passwordHash, isAdmin: true });
  }

  await query(
    `
      UPDATE users
      SET is_admin = TRUE,
          password_hash = $1
      WHERE email = $2
    `,
    [passwordHash, email],
  );

  return getUserByEmail(email);
}

export async function addScanForUser(email, locationId) {
  const existingResult = await query(
    `
      SELECT 1
      FROM scans
      WHERE user_email = $1 AND location_id = $2
    `,
    [email, locationId],
  );

  if (existingResult.rows[0]) {
    return { alreadyScanned: true, user: await getUserByEmail(email) };
  }

  await runInTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO scans (user_email, location_id, scanned_at)
        VALUES ($1, $2, $3)
      `,
      [email, locationId, Date.now()],
    );

    await client.query(
      `
        UPDATE locations
        SET scan_count = scan_count + 1
        WHERE id = $1
      `,
      [locationId],
    );
  });

  return {
    alreadyScanned: false,
    user: await getUserByEmail(email),
  };
}
