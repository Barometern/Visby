// src/lib/game-state.ts

import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, backendLocationSchema, type BackendUser } from './api';
import type { Language } from './i18n';
import type { LocationData } from './location-types';

export type { LocationData } from './location-types';

const CACHE_KEY = 'visby-quest-locations-cache:v2';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

type CachedLocations = {
  data: z.infer<typeof backendLocationSchema>[];
  cachedAt: number;
};

/** Schema for the full cache envelope stored in localStorage. */
const cacheEnvelopeSchema = z.object({
  data: z.array(backendLocationSchema),
  cachedAt: z.number(),
});

function loadCache(): CachedLocations | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const result = cacheEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!result.success) return null;
    if (Date.now() - result.data.cachedAt > CACHE_TTL) return null;
    return result.data;
  } catch {
    return null;
  }
}

function saveCache(data: z.infer<typeof backendLocationSchema>[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        data,
        cachedAt: Date.now(),
      })
    );
  } catch {}
}

/**
 * Validate and convert a raw (unknown) value into a LocationData.
 * The schema validates the shape; the controlled cast to LocationData is safe
 * because BackendLocation and LocationData are structurally identical at runtime
 * (the only difference is the Record key constraint: 'string' vs Language union).
 */
function toLocationData(raw: unknown): LocationData {
  const location = backendLocationSchema.parse(raw);
  return location as unknown as LocationData;
}

function deriveUnlockedPieces(locations: LocationData[], scanned: string[]) {
  return locations.reduce<number[]>((acc, loc, i) => {
    if (scanned.includes(loc.id)) acc.push(i);
    return acc;
  }, []);
}

interface GameState {
  language: Language;
  setLanguage: (lang: Language) => void;

  // split state
  locationsStatus: 'idle' | 'loading' | 'ready' | 'error';
  authStatus: 'anonymous' | 'loading' | 'loggedIn';

  locationsError?: string;
  authError?: string;

  isLoggedIn: boolean;
  isAdmin: boolean;
  hasPaid: boolean;
  userEmail: string;

  locations: LocationData[];
  scannedLocations: string[];
  unlockedPieces: number[];

  bootstrapApp: (defaults: LocationData[]) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  purchaseFullAccess: () => Promise<void>;
  scanLocation: (id: string) => Promise<{ alreadyScanned: boolean }>;
  updateLocation: (id: string, data: Partial<LocationData>) => Promise<void>;
  addLocation: (data: LocationData) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
}

function applyUser(user: BackendUser, set: (partial: Partial<GameState>) => void, get: () => GameState) {
  const locations = get().locations;

  set({
    authStatus: 'loggedIn',
    isLoggedIn: true,
    isAdmin: user.isAdmin,
    hasPaid: user.hasPaid,
    userEmail: user.email,
    scannedLocations: user.scannedLocations,
    unlockedPieces: deriveUnlockedPieces(locations, user.scannedLocations),
    authError: undefined,
  });
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      language: 'sv',
      setLanguage: (language) => set({ language }),

      locationsStatus: 'idle',
      authStatus: 'anonymous',

      isAdmin: false,
      hasPaid: false,
      userEmail: '',
      isLoggedIn: false,

      locations: [],
      scannedLocations: [],
      unlockedPieces: [],

      bootstrapApp: async (defaults) => {
        set({ locationsStatus: 'loading', authStatus: 'loading' });

        const fallback = defaults.map(l => ({ ...l }));
        const cached = loadCache();

        // 🚀 instant paint from cache
        if (cached) {
          set({
            locations: cached.data.map(toLocationData),
            locationsStatus: 'ready',
          });
        }

        // 🌐 fetch fresh in background
        try {
          const res = await api.getLocations();
          const fresh = res.locations;

          saveCache(fresh);

          set({
            locations: fresh.map(toLocationData),
            locationsStatus: 'ready',
          });
        } catch (e) {
          if (!cached) {
            set({
              locations: fallback,
              locationsStatus: 'error',
              locationsError: 'Failed to load locations',
            });
          }
        }

        // 👤 auth separately
        try {
          const res = await api.me();
          applyUser(res.user, set, get);
        } catch {
          set({ authStatus: 'anonymous' });
        }
      },

      scanLocation: async (id) => {
        const prevScanned = get().scannedLocations;
        const prevUnlocked = get().unlockedPieces;

        // ⚡ optimistic update
        if (!prevScanned.includes(id)) {
          const next = [...prevScanned, id];
          set({
            scannedLocations: next,
            unlockedPieces: deriveUnlockedPieces(get().locations, next),
          });
        }

        try {
          const res = await api.scanLocation(id);
          applyUser(res.user, set, get);
          return { alreadyScanned: res.alreadyScanned };
        } catch (e) {
          // rollback both optimistically updated fields
          set({ scannedLocations: prevScanned, unlockedPieces: prevUnlocked });
          throw e;
        }
      },

      login: async (email, password) => {
        const res = await api.login(email, password);
        applyUser(res.user, set, get);
      },

      signup: async (email, password) => {
        const res = await api.signup(email, password);
        applyUser(res.user, set, get);
      },

      logout: async () => {
        try {
          await api.logout();
        } catch {
          // Let local cleanup happen even if the server session is already gone.
        }
        set({
          authStatus: 'anonymous',
          isLoggedIn: false,
          isAdmin: false,
          userEmail: '',
          hasPaid: false,
          unlockedPieces: [],
          scannedLocations: [],
          authError: undefined,
        });
      },

      purchaseFullAccess: async () => {
        const res = await api.purchase();
        applyUser(res.user, set, get);
      },

      updateLocation: async (id, data) => {
        const currentLocations = get().locations;
        const current = currentLocations.find((loc) => loc.id === id);
        if (!current) return;
        const nextLocation = { ...current, ...data };
        const res = await api.updateLocation(id, nextLocation as BackendLocation);
        const updatedLocation = toLocationData(res.location);
        const nextLocations = currentLocations.map((loc) =>
          loc.id === id ? updatedLocation : loc,
        );
        set({
          locations: nextLocations,
          unlockedPieces: deriveUnlockedPieces(nextLocations, get().scannedLocations),
        });
      },

      addLocation: async (data) => {
        const res = await api.createLocation(data as BackendLocation);
        set({ locations: [...get().locations, toLocationData(res.location)] });
      },

      removeLocation: async (id) => {
        await api.deleteLocation(id);
        const nextLocations = get().locations.filter((loc) => loc.id !== id);
        set({
          locations: nextLocations,
          unlockedPieces: deriveUnlockedPieces(nextLocations, get().scannedLocations),
        });
      },
    }),
    {
      name: 'visby-quest-state',
      partialize: (s) => ({
        language: s.language,
        scannedLocations: s.scannedLocations, // optional UX boost
      }),
    }
  )
);
