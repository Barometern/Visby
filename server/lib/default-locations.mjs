import { readFileSync } from "node:fs";
import path from "node:path";

const GAME_STATE_PATH = path.resolve(process.cwd(), "src/lib/game-state.ts");

export function loadBundledLocations() {
  const source = readFileSync(GAME_STATE_PATH, "utf8");
  const match = source.match(
    /export const VISBY_LOCATIONS:\s*LocationData\[\]\s*=\s*(\[[\s\S]*?\n\]);/,
  );

  if (!match) {
    throw new Error("Could not extract VISBY_LOCATIONS from src/lib/game-state.ts");
  }

  return Function(`"use strict"; return (${match[1]});`)();
}
