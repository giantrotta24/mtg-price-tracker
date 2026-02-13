# Vercel Setup (Free Tier)

This project is configured for Vercel with Next.js framework defaults.

## Environment Model

Use Vercel environments as:

- `Production`: real deployment for `main`
- `Preview`: testing environment for branches/PRs
- `Development`: local `vercel dev` (optional)

For MVP safety, keep side effects disabled in Preview:

- `PRICE_REFRESH_ENABLED=false`
- `TELEGRAM_ALERTS_ENABLED=false`

Then enable only in Production when you're ready:

- `PRICE_REFRESH_ENABLED=true`
- `TELEGRAM_ALERTS_ENABLED=true`

## Manual Steps in Vercel Dashboard

1. Import this Git repository as a new Vercel project.
2. Set the Production Branch to `main`.
3. In Project Settings -> Environment Variables, add variables from `.env.example`.
4. Assign env vars by environment:
   - `Preview`: use test/sandbox values and disable toggles
   - `Production`: use real values
5. Set `NEXT_PUBLIC_SITE_URL`:
   - `Production`: your custom domain or Vercel production URL
   - `Preview`: leave blank or use preview URL pattern if needed
6. Keep `CRON_SECRET` set but unused for now (strong random string).
7. Deploy `main` once; verify `/api/health` returns `ok`.

## Minimum Env Vars to Start

You can launch the scaffold without full integrations by setting placeholder values, but these must exist:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `CRON_SECRET`

Keep provider + Telegram keys empty until those features are implemented.

## Free Tier Notes

- One Vercel project can provide both Production and Preview environments.
- Keep expensive integrations disabled in Preview to stay within limits.
