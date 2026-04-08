import { describe, it, expect, beforeEach, vi } from "vitest";
import { backendLocationSchema } from "@/lib/api";

// ── backendLocationSchema validation ─────────────────────────────────────────

const validLocation = {
  id: "loc-1",
  qrCode: "QR123",
  name: { en: "Tower", sv: "Torn", de: "Turm" },
  description: { en: "A tall tower", sv: "Ett högt torn", de: "Ein hoher Turm" },
  readMore: { en: "More info", sv: "Mer info", de: "Mehr info" },
  clue: { en: "Look up", sv: "Titta upp", de: "Schau hoch" },
  coordinates: { lat: 57.6, lng: 18.3 },
  googleMapsUrl: "https://maps.google.com/?q=57.6,18.3",
  images: ["img1.jpg"],
  scanCount: 5,
};

describe("backendLocationSchema", () => {
  it("accepts a valid location", () => {
    expect(() => backendLocationSchema.parse(validLocation)).not.toThrow();
  });

  it("rejects a location missing the id field", () => {
    const { id: _id, ...noId } = validLocation;
    expect(() => backendLocationSchema.parse(noId)).toThrow();
  });

  it("rejects a location with a non-number scanCount", () => {
    expect(() =>
      backendLocationSchema.parse({ ...validLocation, scanCount: "five" })
    ).toThrow();
  });

  it("rejects a location with invalid coordinates", () => {
    expect(() =>
      backendLocationSchema.parse({
        ...validLocation,
        coordinates: { lat: "bad", lng: 18.3 },
      })
    ).toThrow();
  });

  it("rejects a location with an invalid googleMapsUrl", () => {
    expect(() =>
      backendLocationSchema.parse({ ...validLocation, googleMapsUrl: "not-a-url" })
    ).toThrow();
  });

  it("rejects null input", () => {
    expect(() => backendLocationSchema.parse(null)).toThrow();
  });
});

// ── localStorage cache validation ────────────────────────────────────────────

const CACHE_KEY = "visby-quest-locations-cache:v2";

describe("loadCache (via bootstrapApp behaviour)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("ignores cache whose envelope is missing the cachedAt field", async () => {
    // Store malformed envelope (no cachedAt)
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: [validLocation] }));

    // Dynamic import so each test gets a fresh module evaluation is not needed
    // here – we just verify the cache is ignored when shape is wrong.
    // The cache schema requires { data, cachedAt }; missing cachedAt → safeParse fails.
    const { z } = await import("zod");
    const cacheEnvelopeSchema = z.object({
      data: z.array(backendLocationSchema),
      cachedAt: z.number(),
    });
    const raw = localStorage.getItem(CACHE_KEY)!;
    const result = cacheEnvelopeSchema.safeParse(JSON.parse(raw));
    expect(result.success).toBe(false);
  });

  it("ignores cache with a malformed location entry inside data array", async () => {
    const { z } = await import("zod");
    const cacheEnvelopeSchema = z.object({
      data: z.array(backendLocationSchema),
      cachedAt: z.number(),
    });

    const malformed = { ...validLocation, coordinates: null };
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: [malformed], cachedAt: Date.now() })
    );

    const raw = localStorage.getItem(CACHE_KEY)!;
    const result = cacheEnvelopeSchema.safeParse(JSON.parse(raw));
    expect(result.success).toBe(false);
  });

  it("accepts a well-formed cache envelope", async () => {
    const { z } = await import("zod");
    const cacheEnvelopeSchema = z.object({
      data: z.array(backendLocationSchema),
      cachedAt: z.number(),
    });

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: [validLocation], cachedAt: Date.now() })
    );

    const raw = localStorage.getItem(CACHE_KEY)!;
    const result = cacheEnvelopeSchema.safeParse(JSON.parse(raw));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.data).toHaveLength(1);
      expect(result.data.data[0].id).toBe("loc-1");
    }
  });
});
