import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { listLocations } from '../lib/db.mjs';

const root = process.cwd();
const exportDir = path.resolve(root, 'server/exports');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const destination = path.join(exportDir, `locations-${stamp}.json`);

mkdirSync(exportDir, { recursive: true });
const locations = await listLocations();
writeFileSync(destination, JSON.stringify(locations, null, 2));
console.log(destination);
