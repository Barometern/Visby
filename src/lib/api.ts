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
  clue: Record<string, string>;
  coordinates: { lat: number; lng: number };
  googleMapsUrl: string;
  images: string[];
  scanCount: number;
}

export interface ScanResponse {
  alreadyScanned: boolean;
  user: BackendUser;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
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

  return payload as T;
}

export const api = {
  signup(email: string, password: string) {
    return apiRequest<{ user: BackendUser }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  login(email: string, password: string) {
    return apiRequest<{ user: BackendUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  logout() {
    return apiRequest<{ ok: true }>("/api/auth/logout", { method: "POST" });
  },
  me() {
    return apiRequest<{ user: BackendUser }>("/api/me", { method: "GET" });
  },
  purchase() {
    return apiRequest<{ user: BackendUser }>("/api/payments/mock-checkout", {
      method: "POST",
    });
  },
  scanLocation(locationId: string) {
    return apiRequest<ScanResponse>("/api/progress/scan", {
      method: "POST",
      body: JSON.stringify({ locationId }),
    });
  },
  getLocations() {
    return apiRequest<{ locations: BackendLocation[] }>("/api/locations", {
      method: "GET",
    });
  },
  createLocation(location: BackendLocation) {
    return apiRequest<{ location: BackendLocation }>("/api/admin/locations", {
      method: "POST",
      body: JSON.stringify({ location }),
    });
  },
  updateLocation(locationId: string, location: BackendLocation) {
    return apiRequest<{ location: BackendLocation }>(`/api/admin/locations/${locationId}`, {
      method: "PUT",
      body: JSON.stringify({ location }),
    });
  },
  deleteLocation(locationId: string) {
    return apiRequest<{ ok: true }>(`/api/admin/locations/${locationId}`, {
      method: "DELETE",
    });
  },
};
