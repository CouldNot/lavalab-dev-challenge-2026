# Toph Dashboard

A responsive dashboard for reviewing farm activity logs and recordings.

## Stack

- Next.js 16, React 19, TypeScript
- Supabase Postgres, Auth, Storage, and row-level security
- Leaflet with OpenStreetMap
- Vitest and Playwright

## Features

- Search, sorting, filtering, map view, audio playback, and tagging
- Recording review states: new, reviewed, and flagged
- Persistent hosted data with role-based access control
- Private recordings served with short-lived signed URLs
- Local fallback demo mode without external services

## Deployment

The production deployment uses GitHub, Vercel, and Supabase:

1. Applied the SQL migrations and seed data to a hosted Supabase project.
2. Ran `npm run bootstrap:demo` locally against Supabase to create the demo account and upload the private demo recording.
3. Imported the GitHub repository into Vercel as a Next.js project.
4. Configured Vercel Production variables for the Supabase URL, publishable key, demo email, and demo password.
5. Configured the Supabase Auth Site URL and redirect URLs for the Vercel production domain.
6. Deployed with the default Vercel Next.js build using `npm run build`.

The Supabase secret key was used only for the one-time local bootstrap and was not added to Vercel.

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Without environment variables, the app runs in local demo mode. Hosted mode requires the variables in `.env.example`.

## Verification

```bash
npm run test:all
npm run test:e2e
npm run db:test
```

See [architecture notes](docs/ARCHITECTURE.md) and [design QA notes](docs/DESIGN-QA.md).
