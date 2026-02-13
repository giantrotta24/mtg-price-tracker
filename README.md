# MTG Price Tracker

A personal Magic: The Gathering singles price tracker.

## Current Slice Status

This repo now includes Slice 1 foundation work:

- Next.js app scaffold
- Supabase magic-link auth routes and callback flow
- Drizzle ORM schema for Slice 1 data model
- Supabase SQL migrations (schema + RLS policies)
- Health endpoint and baseline tests

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Drizzle ORM + Drizzle Kit
- Vitest + React Testing Library
- pnpm

## Local Development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Setup

1. Create a Supabase project.
2. Fill `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL` (for magic link callback)
3. Apply migrations in Supabase SQL editor or your migration runner:
- `supabase/migrations/0001_init.sql`
- `supabase/migrations/0002_rls.sql`

You can also use Drizzle commands for local iteration:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

## Auth Endpoints

- `POST /api/auth/sign-in` (send magic link)
- `GET /auth/callback` (exchange auth code for session)
- `POST /api/auth/sign-out`
- `GET /api/auth/session`

## Quality Checks

```bash
pnpm lint
pnpm test:ci
pnpm build
```

## Deployment

Vercel deployment setup (including production + preview/testing environment strategy) is documented in:

- `docs/vercel-setup.md`

## License

MIT. See `LICENSE`.
