# Real Food Finder

Map-first app for sourcing real food directly from farms, homes, stores, and community drop points.

## Stack

- Next.js (App Router)
- shadcn/ui
- Leaflet + react-leaflet (map)
- Drizzle ORM + Neon/Postgres

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill in:

- `LOCAL_DATABASE_URL`: local Docker Postgres (default in `.env.example`).
- `DATABASE_URL`: Neon URL for production/deployment.
- `ADMIN_DASHBOARD_KEY`: optional key used by `/admin?key=...`.

4. Start local Postgres:

```bash
pnpm db:local:up
```

5. Generate and run migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

6. Start dev server:

```bash
pnpm dev
```

7. Optional local SQL access:

```bash
pnpm db:local:psql
```

## Routes

- `/`: map-first landing page.
- `/locations`: approved location listing with details.
- `/submit`: public location submission page.
- `/admin`: moderation dashboard (approve/reject).

## Notes

- DB URL priority is `LOCAL_DATABASE_URL` then `DATABASE_URL`.
- If both are missing, the app falls back to in-memory sample data for quick development.
- Neon docs often show `drizzle-orm/neon-http`, which is perfect for Neon-only apps. This project uses `drizzle-orm/node-postgres` so one setup works for both Neon and local Docker Postgres.
- In production, lock down `/admin` with real auth (Clerk/Auth.js/etc.) instead of key-in-query.
