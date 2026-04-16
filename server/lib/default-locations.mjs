import { readFileSync } from "node:fs";
import path from "node:path";

const LOCATIONS_PATH = path.resolve(process.cwd(), "src/data/locations.json");

export function loadBundledLocations() {
  return JSON.parse(readFileSync(LOCATIONS_PATH, "utf8"));
}
