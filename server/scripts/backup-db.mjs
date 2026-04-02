import { copyFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = path.resolve(root, 'server/data/visby-quest.sqlite');
const backupDir = path.resolve(root, 'server/backups');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const destination = path.join(backupDir, `visby-quest-${stamp}.sqlite`);

mkdirSync(backupDir, { recursive: true });
copyFileSync(source, destination);
console.log(destination);
