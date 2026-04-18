import { z } from "zod";

export interface BackendUser {
  email: string;
  isAdmin: boolean;
  hasPaid: boolean;
  scannedLocations: string[];
}

export interface BackendLocation {
  id: string;
  qrCode: string;
  name: Record<string, string>;
  description: Record<string, string>;
  readMore: Record<string, string>;
  clue: Record<string, string[]>;
  coordinates: { lat: number; lng: number };
  googleMapsUrl: string;
  images: string[];
  scanCount: number;
  hints?: string[];
  orderIndex?: number | null;
  isDamaged?: boolean;
}

export interface UnlockResponse {
  alreadyScanned: boolean;
  locationId: string;
  user: BackendUser;
}

export interface ScanResponse {
  alreadyScanned: boolean;
  user: BackendUser;
}

const backendUserSchema = z.object({
  email: z.string().email(),
  isAdmin: z.boolean(),
  hasPaid: z.boolean(),
  scannedLocations: z.array(z.string()),
});

const localizedRecordSchema = z.record(z.string(), z.string());

const backendLocationSchema = z.object({
  id: z.string(),
  qrCode: z.string(),
  name: localizedRecordSchema,
  description: localizedRecordSchema,
  readMore: localizedRecordSchema,
  clue: z.record(z.string(), z.array(z.string())),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  googleMapsUrl: z.string().url(),
  images: z.array(z.string()),
  scanCount: z.number(),
  hints: z.array(z.string()).optional(),
  orderIndex: z.number().nullable().optional(),
  isDamaged: z.boolean().optional(),
});

const scanResponseSchema = z.object({
  alreadyScanned: z.boolean(),
  user: backendUserSchema,
});

const unlockResponseSchema = z.object({
  alreadyScanned: z.boolean(),
  locationId: z.string(),
  user: backendUserSchema,
});

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>,
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "include",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.error === "string" ? payload.error : "Request failed.";
    throw new Error(message);
  }

  return schema ? schema.parse(payload) : (payload as T);
}

export const api = {
  signup(email: string, password: string) {
    return apiRequest<{ user: BackendUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, z.object({ user: backendUserSchema }));
  },
  login(email: string, password: string) {
    return apiRequest<{ user: BackendUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, z.object({ user: backendUserSchema }));
  },
  logout() {
    return apiRequest<{ ok: true }>("/api/auth/logout", { method: "POST" }, z.object({ ok: z.literal(true) }));
  },
  me() {
    return apiRequest<{ user: BackendUser }>("/api/me", { method: "GET" }, z.object({ user: backendUserSchema }));
  },
  purchase() {
    return apiRequest<{ user: BackendUser }>("/api/payments/mock-checkout", {
      method: "POST",
    }, z.object({ user: backendUserSchema }));
  },
  scanLocation(locationId: string) {
    return apiRequest<ScanResponse>("/api/progress/scan", {
      method: "POST",
      body: JSON.stringify({ locationId }),
    }, scanResponseSchema);
  },
  getLocations() {
    return apiRequest<{ locations: BackendLocation[] }>("/api/locations", {
      method: "GET",
    }, z.object({ locations: z.array(backendLocationSchema) }));
  },
  createLocation(location: BackendLocation) {
    return apiRequest<{ location: BackendLocation }>("/api/admin/locations", {
      method: "POST",
      body: JSON.stringify({ location }),
    }, z.object({ location: backendLocationSchema }));
  },
  updateLocation(locationId: string, location: BackendLocation) {
    return apiRequest<{ location: BackendLocation }>(`/api/admin/locations/${locationId}`, {
      method: "PUT",
      body: JSON.stringify({ location }),
    }, z.object({ location: backendLocationSchema }));
  },
  deleteLocation(locationId: string) {
    return apiRequest<{ ok: true }>(`/api/admin/locations/${locationId}`, {
      method: "DELETE",
    }, z.object({ ok: z.literal(true) }));
  },
  unlockByManualCode(code: string) {
    return apiRequest<UnlockResponse>("/api/progress/manual-code", {
      method: "POST",
      body: JSON.stringify({ code }),
    }, unlockResponseSchema);
  },
  unlockByGps(locationId: string, latitude: number, longitude: number) {
    return apiRequest<UnlockResponse>("/api/progress/gps-unlock", {
      method: "POST",
      body: JSON.stringify({ locationId, latitude, longitude }),
    }, unlockResponseSchema);
  },
  reportDamaged(locationId: string) {
    return apiRequest<UnlockResponse>("/api/progress/report-damaged", {
      method: "POST",
      body: JSON.stringify({ locationId }),
    }, unlockResponseSchema);
  },
};
