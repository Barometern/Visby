const BASE_URL = process.env.BASE_URL || "http://localhost:8787";
const LOCATION_ID = process.env.LOCATION_ID || "loc-1";
const CONCURRENCY = Number(process.env.CONCURRENCY || 10);
const REQUESTS_PER_WORKER = Number(process.env.REQUESTS_PER_WORKER || 5);
const ACCOUNT_PREFIX = process.env.ACCOUNT_PREFIX || "loadtest";
const PASSWORD = process.env.PASSWORD || "loadtest123";

function assertNumber(value, label) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}

assertNumber(CONCURRENCY, "CONCURRENCY");
assertNumber(REQUESTS_PER_WORKER, "REQUESTS_PER_WORKER");

async function jsonRequest(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));

  return {
    ok: response.ok,
    status: response.status,
    payload,
    headers: response.headers,
  };
}

async function signupOrLogin(email) {
  const signup = await jsonRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });

  if (signup.ok) {
    return signup.headers.get("set-cookie");
  }

  if (signup.status !== 409) {
    throw new Error(`Signup failed for ${email}: ${signup.payload?.error || signup.status}`);
  }

  const login = await jsonRequest("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: PASSWORD }),
  });

  if (!login.ok) {
    throw new Error(`Login failed for ${email}: ${login.payload?.error || login.status}`);
  }

  return login.headers.get("set-cookie");
}

async function runWorker(workerIndex) {
  const email = `${ACCOUNT_PREFIX}+${Date.now()}-${workerIndex}@example.com`;
  const cookie = await signupOrLogin(email);

  if (!cookie) {
    throw new Error(`No session cookie returned for ${email}`);
  }

  const timings = [];
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < REQUESTS_PER_WORKER; i += 1) {
    const startedAt = performance.now();
    const result = await jsonRequest("/api/progress/scan", {
      method: "POST",
      headers: { Cookie: cookie },
      body: JSON.stringify({ locationId: LOCATION_ID }),
    });
    timings.push(performance.now() - startedAt);

    if (result.ok) {
      successCount += 1;
    } else {
      errorCount += 1;
    }
  }

  return { successCount, errorCount, timings };
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, value) => acc + value, 0);

  return {
    min: sorted[0] || 0,
    p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
    max: sorted[sorted.length - 1] || 0,
    avg: sorted.length > 0 ? sum / sorted.length : 0,
  };
}

const startedAt = performance.now();
const results = await Promise.all(
  Array.from({ length: CONCURRENCY }, (_, index) => runWorker(index)),
);
const elapsedMs = performance.now() - startedAt;

const timings = results.flatMap((result) => result.timings);
const successCount = results.reduce((sum, result) => sum + result.successCount, 0);
const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
const summary = summarize(timings);

console.log(JSON.stringify({
  baseUrl: BASE_URL,
  locationId: LOCATION_ID,
  concurrency: CONCURRENCY,
  requestsPerWorker: REQUESTS_PER_WORKER,
  totalRequests: successCount + errorCount,
  successCount,
  errorCount,
  elapsedMs: Number(elapsedMs.toFixed(2)),
  requestsPerSecond: Number((((successCount + errorCount) / elapsedMs) * 1000).toFixed(2)),
  latencyMs: {
    min: Number(summary.min.toFixed(2)),
    p50: Number(summary.p50.toFixed(2)),
    p95: Number(summary.p95.toFixed(2)),
    avg: Number(summary.avg.toFixed(2)),
    max: Number(summary.max.toFixed(2)),
  },
}, null, 2));
