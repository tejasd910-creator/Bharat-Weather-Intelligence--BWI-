# Bharat Weather Intelligence

Real-time weather, citizen reports and social-media weather intelligence for India.
Built with **Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + PostgreSQL (Drizzle ORM) + Leaflet + Recharts**.

---

## Run locally

### 1. Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Node.js | 20 or newer (22 recommended) | `node -v` |
| npm | 10+ | `npm -v` |
| PostgreSQL | 14+ | `psql --version` |

> Don't have Postgres? Easiest option is Docker (see step 3b).

### 2. Get the code & install dependencies

```bash
git clone <your-repo-url> bharat-weather-intelligence
cd bharat-weather-intelligence
npm install
```

(If you downloaded a zip instead, just unzip it, `cd` into the folder and run `npm install`.)

### 3. Start PostgreSQL

**3a. Local Postgres install (Windows / macOS / Linux)**

Create the database once:

```bash
psql -U postgres -c "CREATE DATABASE app_db;"
```

**3b. Or use Docker (no install needed)**

```bash
docker run --name bwi-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_db \
  -p 5432:5432 -d postgres:16
```

### 4. Configure the environment

The project ships with a `.env` file:

```
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

If your Postgres user/password/port differ, just edit this line (copy `.env.example` → `.env` if the file is missing). `drizzle.config.ts` reads the same variable.

### 5. Create tables & seed sample data

```bash
npm run setup
```

This runs `drizzle-kit push` (creates the `reports` table) and then inserts 12 sample citizen reports so the map, dashboard and charts have data on first launch. Safe to re-run — the seed skips if data already exists.

### 6. Start the app

Development (hot reload):

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Open **http://localhost:3000** 🎉

---

## Using the app

- Toggle **User / Admin** in the top-right of the header.
- **User** → Home, Live Weather (search any city), Report Event (with image upload), Live Map (zoomable Leaflet map), Social Media (live mock stream + AI score cards), Data Pipeline.
- **Admin** → everything above plus **Admin Dashboard** (charts) and **Verification Panel** (verify / reject reports).

## Data sources

- **Weather** – real, from [Open-Meteo](https://open-meteo.com) (free, no API key). Needs internet; falls back to typical values if offline.
- **Map tiles** – OpenStreetMap (needs internet).
- **Social media** – mock stream, new post every 5 seconds, generated in the browser.
- **Citizen reports** – stored in your local PostgreSQL.

## Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start dev server on :3000 |
| `npm run build` / `npm start` | Production build & serve |
| `npm run db:push` | Sync schema to the database |
| `npm run db:seed` | Insert sample reports (idempotent) |
| `npm run setup` | `db:push` + `db:seed` |
| `npm run typecheck` | TypeScript check |

## Deploy on Vercel (Vercel-only, no other hosting needed)

Vercel runs the Next.js app; the PostgreSQL database comes from the **Vercel Marketplace (Neon)** — provisioned and billed inside your Vercel account, free tier available.

### 1. Push the code to GitHub

```bash
git init
git add .
git commit -m "Bharat Weather Intelligence"
git branch -M main
git remote add origin https://github.com/<you>/bharat-weather-intelligence.git
git push -u origin main
```

(`.env` is git-ignored — secrets never leave your laptop.)

### 2. Import the project on Vercel

1. Go to https://vercel.com/new → **Import** your GitHub repo.
2. Framework preset is auto-detected as **Next.js**. Leave build settings as default.
3. **Don't click Deploy yet** — first add the database (or deploy now; the first build will fail on the health check until the DB exists, that's fine — just redeploy after step 3).

### 3. Add a Postgres database from the Vercel Marketplace

1. In your Vercel project → **Storage** tab → **Create Database** → choose **Neon** (Serverless Postgres) → Free plan → **Create**.
2. Click **Connect Project**, pick this project, all environments (Production / Preview / Development).
3. Vercel automatically injects `DATABASE_URL` into the project's Environment Variables. ✅  
   (If your provider only injects `POSTGRES_URL`, go to **Settings → Environment Variables** and add `DATABASE_URL` with the same value.)

> Supabase works the same way — pick it instead of Neon in the Marketplace. Use the **pooled** connection string (port 6543) for serverless.

### 4. Create the tables & seed data (run once from your laptop)

Copy the `DATABASE_URL` value from Vercel (**Storage → your DB → .env.local tab**) and run:

```bash
# macOS / Linux
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" npm run setup

# Windows PowerShell
$env:DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"; npm run setup
```

Or use `vercel env pull .env.production.local` (via the Vercel CLI) and then `npm run setup` with that file loaded.

### 5. Deploy

Click **Deploy** (or **Redeploy** in the Deployments tab). After ~1 minute you get a URL like  
`https://bharat-weather-intelligence.vercel.app` 🎉  
Check `https://<your-app>.vercel.app/api/health` → `{"ok":true}`.

Every `git push` to `main` now auto-deploys.

### Vercel notes

- **Weather / map tiles** – fetched live from Open-Meteo & OpenStreetMap; no API keys needed.
- **Image uploads** – capped at 4 MB to stay under Vercel's 4.5 MB serverless request-body limit. Images are stored as base64 in Postgres (fine for a demo; for production use Vercel Blob or S3 and store the URL).
- **Social media stream** – generated in the browser, works everywhere.
- **Schema changes later** – edit `src/db/schema.ts`, then rerun step 4's `npm run db:push` against the production URL.
- **Cold starts** – Neon's free tier suspends after inactivity; the first request after a pause may take 1–2 s.

## Troubleshooting

- **`ECONNREFUSED 127.0.0.1:5432`** → Postgres isn't running, or the port/credentials in `.env` are wrong.
- **`database "app_db" does not exist`** → run step 3a (`CREATE DATABASE app_db;`).
- **`relation "reports" does not exist`** → run `npm run db:push`.
- **Port 3000 busy** → `npm run dev -- -p 3001`.
- **Weather shows "offline · typical values"** → no internet access to `api.open-meteo.com`.
- **Health check** → visit http://localhost:3000/api/health — should return `{"ok":true}` when the DB is connected.
