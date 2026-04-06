import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api, type BackendLocation, type BackendUser } from './api';
import type { Language } from './i18n';
import type { LocationData } from './location-types';

const LOCATIONS_CACHE_KEY = 'visby-quest-locations-cache';

function loadCachedLocations(): BackendLocation[] | null {
  try {
    const raw = localStorage.getItem(LOCATIONS_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BackendLocation[];
  } catch {
    return null;
  }
}

function saveCachedLocations(locations: BackendLocation[]): void {
  try {
    localStorage.setItem(LOCATIONS_CACHE_KEY, JSON.stringify(locations));
  } catch {
    // Storage quota exceeded or unavailable — ignore.
  }
}

interface GameState {
  language: Language;
  setLanguage: (lang: Language) => void;
  isHydrating: boolean;
  authError: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  hasPaid: boolean;
  userEmail: string;
  bootstrapApp: (defaultLocations: LocationData[]) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  purchaseFullAccess: () => Promise<void>;
  unlockedPieces: number[];
  scannedLocations: string[];
  scanLocation: (locationId: string) => Promise<{ alreadyScanned: boolean }>;
  locations: LocationData[];
  updateLocation: (id: string, data: Partial<LocationData>) => Promise<void>;
  addLocation: (data: LocationData) => Promise<void>;
  removeLocation: (id: string) => Promise<void>;
}

function deriveUnlockedPieces(locations: LocationData[], scannedLocations: string[]) {
  return locations.reduce<number[]>((pieces, location, index) => {
    if (scannedLocations.includes(location.id)) {
      pieces.push(index);
    }

    return pieces;
  }, []);
}

function applyUserState(
  user: BackendUser,
  set: (partial: Partial<GameState>) => void,
  get: () => GameState,
) {
  const locations = get().locations;

  set({
    isLoggedIn: true,
    isAdmin: user.isAdmin,
    hasPaid: user.hasPaid,
    userEmail: user.email,
    scannedLocations: user.scannedLocations,
    unlockedPieces: deriveUnlockedPieces(locations, user.scannedLocations),
    authError: null,
  });
}

function toLocationData(location: BackendLocation): LocationData {
  return location as LocationData;
}

async function fetchLocationsFromBackend() {
  const response = await api.getLocations();
  return response.locations.map(toLocationData);
}

export const useGameState = create<GameState>()(
  persist(
    (set, get) => ({
      language: 'sv',
      setLanguage: (lang) => set({ language: lang }),
      isHydrating: true,
      authError: null,
      isLoggedIn: false,
      isAdmin: false,
      hasPaid: false,
      userEmail: '',
      bootstrapApp: async (defaultLocations) => {
        const fallbackLocations = defaultLocations.map((location) => ({ ...location }));

        try {
          let locations: BackendLocation[] = [];

          try {
            const locationsResponse = await api.getLocations();
            locations = locationsResponse.locations;
            saveCachedLocations(locations);
          } catch (error) {
            console.error("Failed to load locations from backend.", error);
            const cached = loadCachedLocations();
            if (cached && cached.length > 0) {
              locations = cached;
            }
          }

          if (locations.length === 0) {
            set({
              locations: fallbackLocations,
            });
          }

          const resolvedLocations =
            locations.length > 0 ? locations.map(toLocationData) : fallbackLocations;

          set({
            locations: resolvedLocations,
          });

          try {
            const response = await api.me();
            applyUserState(response.user, set, get);
          } catch {
            set({
              isLoggedIn: false,
              isAdmin: false,
              hasPaid: false,
              userEmail: '',
              scannedLocations: [],
              unlockedPieces: [],
            });
          }
        } finally {
          set({ isHydrating: false });
        }
      },
      signup: async (email, password) => {
        const response = await api.signup(email, password);
        applyUserState(response.user, set, get);
      },
      login: async (email, password) => {
        const response = await api.login(email, password);
        applyUserState(response.user, set, get);
      },
      logout: async () => {
        try {
          await api.logout();
        } catch {
          // Let local cleanup happen even if the server session is already gone.
        }

        set({
          isLoggedIn: false,
          isAdmin: false,
          userEmail: '',
          hasPaid: false,
          unlockedPieces: [],
          scannedLocations: [],
          authError: null,
        });
      },
      purchaseFullAccess: async () => {
        const response = await api.purchase();
        applyUserState(response.user, set, get);
      },
      unlockedPieces: [],
      scannedLocations: [],
      scanLocation: async (locationId) => {
        const response = await api.scanLocation(locationId);
        const nextLocations = await fetchLocationsFromBackend();
        set({ locations: nextLocations });
        applyUserState(response.user, set, get);
        return { alreadyScanned: response.alreadyScanned };
      },
      locations: [],
      updateLocation: async (id, data) => {
        const currentLocations = get().locations;
        const current = currentLocations.find((location) => location.id === id);
        if (!current) return;

        const nextLocation = { ...current, ...data };
        const response = await api.updateLocation(id, nextLocation as BackendLocation);
        const updatedLocation = toLocationData(response.location);
        const nextLocations = currentLocations.map((location) =>
          location.id === id ? updatedLocation : location,
        );
        set({
          locations: nextLocations,
          unlockedPieces: deriveUnlockedPieces(
            nextLocations,
            get().scannedLocations,
          ),
        });
      },
      addLocation: async (data) => {
        const response = await api.createLocation(data as BackendLocation);
        set({ locations: [...get().locations, toLocationData(response.location)] });
      },
      removeLocation: async (id) => {
        await api.deleteLocation(id);
        const nextLocations = get().locations.filter(loc => loc.id !== id);
        set({
          locations: nextLocations,
          unlockedPieces: deriveUnlockedPieces(nextLocations, get().scannedLocations),
        });
      },
    }),
    {
      name: 'visby-quest-state',
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);
