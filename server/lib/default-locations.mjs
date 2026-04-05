import { readFileSync } from "node:fs";
import path from "node:path";

const LOCATIONS_PATH = path.resolve(process.cwd(), "src/data/locations.ts");

export function loadBundledLocations() {
  const source = readFileSync(LOCATIONS_PATH, "utf8");
  const match = source.match(
    /export const VISBY_LOCATIONS:\s*LocationData\[\]\s*=\s*(\[[\s\S]*?\n\]);/,
  );

  if (!match) {
    throw new Error("Could not extract VISBY_LOCATIONS from src/data/locations.ts");
  }

  return Function(`"use strict"; return (${match[1]});`)();
}
