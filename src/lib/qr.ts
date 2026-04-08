import type { LocationData } from "./location-types";

export function resolveScannedLocationId(decodedText: string, locations: LocationData[]) {
  const normalizedText = decodedText.trim();
  const loweredText = normalizedText.toLowerCase();

  const directMatch = locations.find((location) => {
    const qrCode = location.qrCode?.trim().toLowerCase();
    return qrCode === loweredText;
  });

  if (directMatch) return directMatch.id;

  const visbyQuestMatch = loweredText.match(/visby-quest-(\d+)/);
  if (visbyQuestMatch) {
    const qrCode = `visby-quest-${visbyQuestMatch[1]}`;
    const byQuestCode = locations.find((location) => location.qrCode.toLowerCase() === qrCode);
    if (byQuestCode) return byQuestCode.id;
  }

  try {
    const url = new URL(normalizedText);
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1]?.toLowerCase();
    const qrParam = url.searchParams.get("qr")?.toLowerCase() ?? url.searchParams.get("code")?.toLowerCase();

    const urlMatch = locations.find((location) =>
      location.qrCode.toLowerCase() === lastSegment ||
      location.qrCode.toLowerCase() === qrParam,
    );

    if (urlMatch) return urlMatch.id;
  } catch {
    // Not a URL, continue.
  }

  return null;
}
