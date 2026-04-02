# Visby Quest

Visby Quest ar en platsbaserad React/Vite-app med en liten Node-backend och SQLite for auth, scan-progress och platsdata.

## Lokalt

Starta backend:

```bash
npm run dev:server
```

Starta frontend:

```bash
npm run dev
```

Frontend kor pa `http://localhost:8080` och proxar `/api` till backenden pa `http://localhost:8787`.

## Produktion

Produktion kor som en enda Node-tjanst:

1. bygg frontenden
2. starta backend i production mode
3. backenden serverar bade API och byggda frontendfiler fran `dist`

Bygg:

```bash
npm run build
```

Starta:

```bash
npm run start
```

Viktiga env-vars:

```bash
NODE_ENV=production
ENABLE_ADMIN=false
ADMIN_BOOTSTRAP_EMAIL=your-admin@example.com
ADMIN_BOOTSTRAP_PASSWORD=choose-a-strong-password
```

Om `ADMIN_BOOTSTRAP_EMAIL` och `ADMIN_BOOTSTRAP_PASSWORD` ar satta vid uppstart ser backenden till att den anvandaren finns och har adminrattigheter.

## Sakerhet och data

- `POST /api/bootstrap/locations` ar inte langre publik; den kraver adminsession.
- Nya anvandare blir inte admin genom att registrera en viss e-postadress.
- QR-koder ar unika i backend, bade via route-kontroller och en unik databasindex.
- Lokala artefakter som SQLite-databas, backup, exporter och loggar ar ignorerade i git.

## Driftkommandon

Skapa backup av SQLite:

```bash
npm run backup:db
```

Exportera locations:

```bash
npm run export:locations
```
# Visby
