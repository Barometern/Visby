// src/lib/game-state.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, type BackendLocation, type BackendUser } from './api';
import type { Language } from './i18n';
import type { LocationData } from './location-types';

export type { LocationData } from './location-types';

const CACHE_KEY = 'visby-quest-locations-cache:v2';
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

type CachedLocations = {
  data: BackendLocation[];
  cachedAt: number;
};

function loadCache(): CachedLocations | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedLocations;
    if (Date.now() - parsed.cachedAt > CACHE_TTL) return null;
    return parsed;
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

const LANGUAGES: Language[] = ['en', 'sv', 'de'];

function toLocalized(record: Record<string, string>): Record<Language, string> {
  return Object.fromEntries(
    LANGUAGES.map((lang) => [lang, record[lang] ?? ''])
  ) as Record<Language, string>;
}

function toLocationData(location: BackendLocation): LocationData {
  if (!location.id) throw new Error('Invalid location');
  return {
    ...location,
    name: toLocalized(location.name),
    description: toLocalized(location.description),
    readMore: toLocalized(location.readMore),
    clue: toLocalized(location.clue),
  };
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
  questStartedAt: number | null;
  questCompletedAt: number | null;

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

function deriveQuestTimestamps(
  existingStart: number | null,
  existingComplete: number | null,
  scanned: string[],
  totalLocations: number,
) {
  const hasProgress = scanned.length > 0;
  const isComplete = totalLocations > 0 && scanned.length >= totalLocations;

  return {
    questStartedAt: hasProgress ? existingStart ?? Date.now() : null,
    questCompletedAt: isComplete ? existingComplete ?? Date.now() : null,
  };
}

function applyUser(user: BackendUser, set: (partial: Partial<GameState>) => void, get: () => GameState) {
  const locations = get().locations;
  const timestamps = deriveQuestTimestamps(
    get().questStartedAt,
    get().questCompletedAt,
    user.scannedLocations,
    locations.length,
  );

  set({
    authStatus: 'loggedIn',
    isLoggedIn: true,
    isAdmin: user.isAdmin,
    hasPaid: user.hasPaid,
    userEmail: user.email,
    scannedLocations: user.scannedLocations,
    unlockedPieces: deriveUnlockedPieces(locations, user.scannedLocations),
    ...timestamps,
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
      questStartedAt: null,
      questCompletedAt: null,

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
          const timestamps = deriveQuestTimestamps(
            get().questStartedAt,
            get().questCompletedAt,
            next,
            get().locations.length,
          );
          set({
            scannedLocations: next,
            unlockedPieces: deriveUnlockedPieces(get().locations, next),
            ...timestamps,
          });
        }

        try {
          const res = await api.scanLocation(id);
          applyUser(res.user, set, get);
          return { alreadyScanned: res.alreadyScanned };
        } catch (e) {
          // rollback if needed
          set({
            scannedLocations: prev,
            unlockedPieces: deriveUnlockedPieces(get().locations, prev),
            ...deriveQuestTimestamps(
              get().questStartedAt,
              get().questCompletedAt,
              prev,
              get().locations.length,
            ),
          });
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
          questStartedAt: null,
          questCompletedAt: null,
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
        questStartedAt: s.questStartedAt,
        questCompletedAt: s.questCompletedAt,
      }),
    }
  )
);
