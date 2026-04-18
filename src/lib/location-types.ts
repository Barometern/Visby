import type { Language } from "./i18n";

export interface LocationData {
  id: string;
  qrCode: string;
  name: Record<Language, string>;
  description: Record<Language, string>;
  readMore: Record<Language, string>;
  clue: Record<Language, string[]>;
  coordinates: { lat: number; lng: number };
  googleMapsUrl: string;
  images: string[];
  scanCount: number;
}
