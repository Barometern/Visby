console.error(
  "backup:db used the old SQLite file. The app now runs on Postgres, so use pg_dump or Railway backups instead.",
);
process.exit(1);
