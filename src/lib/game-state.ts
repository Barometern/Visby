// src/lib/game-state.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, type BackendLocation, type BackendUser } from './api';
import type { Language } from './i18n';
import type { LocationData } from './location-types';

const CACHE_KEY = 'visby-quest-locations-cache:v2';
const CACHE_TTL = 1000 * 60 * 5;

type CachedLocations = {
  data: BackendLocation[];
  cachedAt: number;
};

function loadCache(): CachedLocations | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCache(data: BackendLocation[]) {
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

function toLocationData(location: BackendLocation): LocationData {
  // safer than blind cast — shallow validation
  if (!location.id) throw new Error('Invalid location');
  return location as LocationData;
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

  isAdmin: boolean;
  hasPaid: boolean;
  userEmail: string;

  locations: LocationData[];
  scannedLocations: string[];
  unlockedPieces: number[];

  bootstrapApp: (defaults: LocationData[]) => Promise<void>;
  scanLocation: (id: string) => Promise<{ alreadyScanned: boolean }>;
}

function applyUser(user: BackendUser, set: any, get: any) {
  const locations = get().locations;

  set({
    authStatus: 'loggedIn',
    isAdmin: user.isAdmin,
    hasPaid: user.hasPaid,
    userEmail: user.email,
    scannedLocations: user.scannedLocations,
    unlockedPieces: deriveUnlockedPieces(locations, user.scannedLocations),
    authError: null,
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
        const prev = get().scannedLocations;

        // ⚡ optimistic update
        if (!prev.includes(id)) {
          const next = [...prev, id];
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
          // rollback if needed
          set({ scannedLocations: prev });
          throw e;
        }
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
