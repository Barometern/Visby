import { appendFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const LOG_DIR = path.resolve(process.cwd(), 'server/logs');
const LOG_PATH = path.join(LOG_DIR, 'server.log');

mkdirSync(LOG_DIR, { recursive: true });

export function logEvent(level, event, details = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    event,
    ...details,
  };

  const line = `${JSON.stringify(entry)}\n`;
  appendFileSync(LOG_PATH, line, 'utf8');

  const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
  console[method](`[${entry.ts}] ${event}`, details);
}

export function logInfo(event, details) {
  logEvent('info', event, details);
}

export function logWarn(event, details) {
  logEvent('warn', event, details);
}

export function logError(event, details) {
  logEvent('error', event, details);
}
