# Toph dashboard challenge

A full-stack implementation of the supplied Toph dashboard design. The reference artboards were inspected at their native **1676 × 955 px** size and translated into a responsive Next.js application with authenticated, persistent Supabase data.

## What is implemented

- Pixel-conscious dashboard and expanded-recording states using the original dimensions, spacing, typography, colors, and table data.
- One-click demo authentication with server-managed Supabase sessions.
- Persistent farms, memberships, employees, fields, activity logs, recordings, and tags.
- Private audio storage with short-lived signed playback URLs.
- Search, sorting, field/activity filters, month/all toggling, row expansion, audio playback, tag creation, map preview, and an expanded map dialog.
- Local fallback mode for review without credentials; its sign-in and added tags persist in secure cookies.
- Responsive desktop, tablet, and mobile behavior.
- Type, lint, unit, browser, production-build, and database-policy test coverage.

## Stack and why

- **Next.js App Router + TypeScript:** one deployable codebase for the React UI, server-rendered data, protected mutations, and the demo audio endpoint. Server Components keep database credentials and data access off the browser; Server Actions keep tag and auth mutations small and explicit.
- **Supabase Postgres:** the page is relational by nature—a farm has members, workers, fields, logs, recordings, and tags. Postgres preserves those relationships and constraints better than an unstructured document store.
- **Supabase Auth + RLS:** authorization is enforced beside the data, not only in the UI. Every tenant-owned read is scoped through farm membership; only owners/managers can change tags.
- **Supabase private Storage:** audio is not public. The server produces 15-minute signed URLs after RLS-backed data access.
- **Leaflet + OpenStreetMap:** the design calls for a real map, and this keeps the implementation functional without requiring a paid map token. Attribution remains visible.
- **Vercel:** it has first-class Next.js support, preview deployments, encrypted environment variables, and a minimal operational surface for a challenge-sized project.
- **CSS Modules:** the artboard relies on exact custom geometry rather than a generic component kit. Scoped CSS keeps that control without shipping a runtime styling layer.

More detail, including the trust boundaries and ERD, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The design translation checklist is in [docs/DESIGN-QA.md](docs/DESIGN-QA.md).

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, then choose **Continue as demo farmer**. With no environment variables, the app deliberately runs in local-demo mode, so reviewers can exercise the entire UI immediately.

## Run with Supabase persistence

1. Install Docker Desktop and authenticate the Supabase CLI if necessary.
2. Copy `.env.example` to `.env.local`.
3. Start and seed the local stack:

```bash
npm run db:start
npm run db:reset
```

4. Copy the local API URL, publishable key, and secret key printed by `supabase status` into `.env.local`. Set a strong `DEMO_PASSWORD`.
5. Create the demo Auth user, farm membership, and private audio object:

```bash
npm run bootstrap:demo
npm run dev
```

The migration is [supabase/migrations/202609170001_initial_schema.sql](supabase/migrations/202609170001_initial_schema.sql), deterministic sample data is [supabase/seed.sql](supabase/seed.sql), and the idempotent auth/storage bootstrap is [scripts/bootstrap-demo.mjs](scripts/bootstrap-demo.mjs).

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run db:test       # with the local Supabase stack running
```

The browser suite runs at the source artboard viewport and an iPhone viewport. It tests login, the four-row default state, expanded recording, search, and persisted tag creation.

## Deploy to Vercel

1. Create a hosted Supabase project and apply the migration/seed with `supabase db push` and `supabase db seed` (or run the SQL in the dashboard).
2. Set the five values from `.env.example` in the Vercel project. Keep `SUPABASE_SECRET_KEY` and `DEMO_PASSWORD` server-only.
3. Run `npm run bootstrap:demo` against the hosted Supabase project once.
4. Import this repository into Vercel or run `npx vercel --prod`.
5. Set `NEXT_PUBLIC_SITE_URL` to the production URL, verify `/login`, then run the browser suite against that URL before submission.

No service-role/secret key is ever referenced by client code. The app still re-checks the authenticated user in every mutation, and the database independently enforces tenant and role boundaries.
