# Toph Dashboard

A responsive dashboard for reviewing farm activity logs and recordings.

## Highlights

- Dashboard, search, sorting, filters, map, audio playback, and tagging
- Recording review states: needs review, reviewed, and flagged
- Persistent Supabase data with role-based access controls
- Private audio storage with short-lived signed URLs
- Local demo mode works without environment variables
- Desktop and mobile browser coverage

## Stack

- Next.js 16, React 19, TypeScript
- Supabase Postgres, Auth, Storage, and RLS
- Leaflet with OpenStreetMap
- Vitest and Playwright

See [architecture notes](docs/ARCHITECTURE.md) and [design QA notes](docs/DESIGN-QA.md).

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and select **Continue as demo farmer**.

## Run with Supabase

1. Copy `.env.example` to `.env.local`.
2. Start and reset the local Supabase stack:

```bash
npm run db:start
npm run db:reset
```

3. Add the local Supabase URL, publishable key, secret key, and `DEMO_PASSWORD` to `.env.local`.
4. Create demo auth and audio data:

```bash
npm run bootstrap:demo
npm run dev
```

## Verify

```bash
npm run test:all
npm run test:e2e
npm run db:test
```

## Deploy

1. Apply migrations and seed data to Supabase:

```bash
supabase db push
supabase db seed
```

2. Set the values from `.env.example` in Vercel.
3. Run `npm run bootstrap:demo` against the hosted Supabase project.
4. Deploy.
