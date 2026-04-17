import { loadBundledLocations } from '../lib/default-locations.mjs';
import { deleteLocationIfQrCodeMismatch, upsertLocation } from '../lib/db.mjs';

const locations = loadBundledLocations();
console.log(`Syncing ${locations.length} locations...`);

for (const loc of locations) {
  await deleteLocationIfQrCodeMismatch(loc.qrCode, loc.id);
  await upsertLocation(loc);
  console.log(`  ✓ ${loc.id} (${loc.name.sv})`);
}

console.log('Done.');
process.exit(0);
