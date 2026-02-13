# MVP Plan: Personal MTG Singles Tracker (Slice 1 Only)

## Summary

Build a personal web app that tracks MTG single-card prices and sends Telegram threshold alerts when market price is at or below your target.

Chosen MVP constraints:

- Singles only
- Threshold alerts only
- No sealed products, no daily digest, no chart UI in MVP

## Locked Technical Decisions

- Frontend/backend framework: Next.js App Router + TypeScript
- Styling/UI: Tailwind + accessible component patterns
- Database/Auth: Supabase Postgres + Supabase magic link auth
- ORM/migrations: Drizzle ORM
- Scheduling: Vercel Cron (`*/6h` refresh)
- Notification channel: Telegram Bot API
- Price ingestion posture: API-first
- Testing stack: Vitest + React Testing Library + MSW + Playwright + axe
- Rollout control: env toggles (`PRICE_REFRESH_ENABLED`, `TELEGRAM_ALERTS_ENABLED`)

## Scope

### In Scope

1. Sign in with email magic link.
2. Search and add MTG singles to a watchlist.
3. Store and refresh current market price snapshots every 6 hours.
4. Trigger Telegram alert when price is at/below target with cooldown protection.
5. Responsive, WCAG 2.2 AA-compliant UI.

### Out of Scope

1. Sealed product tracking.
2. Historical chart UI.
3. Daily digest notifications.
4. Multi-provider scraping fallback.
5. Advanced analytics.

## Data Model (Exact)

### Enums

- `provider_t`: `tcgplayer`
- `watch_status_t`: `active | paused | archived`
- `alert_state_t`: `unknown | above_target | below_or_equal_target`
- `alert_delivery_t`: `sent | failed | suppressed_toggle | suppressed_cooldown`

### Tables

#### `watch_items`

- `id` UUID PK
- `user_id` UUID FK -> `auth.users(id)`
- `provider` enum `provider_t`
- `external_card_id` text
- `card_name` text
- `set_name` text nullable
- `set_code` text nullable
- `collector_number` text nullable
- `finish` text default `nonfoil`
- `condition` text default `NM`
- `currency` char(3) default `USD`
- `target_price` numeric(10,2) check `> 0`
- `current_market_price` numeric(10,2) nullable
- `last_checked_at` timestamptz nullable
- `alert_state` enum `alert_state_t` default `unknown`
- `last_alerted_at` timestamptz nullable
- `alert_cooldown_hours` int default `24` check `1..168`
- `status` enum `watch_status_t` default `active`
- timestamps `created_at`, `updated_at`
- unique key: `(user_id, provider, external_card_id, finish, condition)`

Indexes:

- `(user_id, status)`
- `(last_checked_at)`

#### `price_snapshots`

- `id` UUID PK
- `watch_item_id` UUID FK -> `watch_items(id)`
- `observed_at` timestamptz default now
- `market_price` numeric(10,2)
- `currency` char(3) default `USD`
- `provider` enum `provider_t`
- `raw_payload` jsonb

Index:

- `(watch_item_id, observed_at desc)`

#### `alert_events`

- `id` UUID PK
- `watch_item_id` UUID FK -> `watch_items(id)`
- `snapshot_id` UUID FK nullable -> `price_snapshots(id)`
- `triggered_at` timestamptz default now
- `trigger_price` numeric(10,2)
- `target_price` numeric(10,2)
- `delivery` enum `alert_delivery_t`
- `error_message` text nullable

Index:

- `(watch_item_id, triggered_at desc)`

#### `job_runs`

- `id` UUID PK
- `job_name` text
- `started_at` timestamptz
- `finished_at` timestamptz nullable
- `status` text (`running|success|failed`)
- `processed_count`, `updated_count`, `alerted_count`, `failed_count` ints
- `error_summary` text nullable

## Public API (Slice 1)

1. `GET /api/cards/search?q=<query>&limit=<1-20>`
2. `POST /api/watch-items`
3. `GET /api/watch-items`
4. `PATCH /api/watch-items/:id`
5. `DELETE /api/watch-items/:id` (soft archive)
6. `POST /api/jobs/refresh-prices` (cron secret protected)

## Alert Semantics

On each refresh:

1. Skip all work if `PRICE_REFRESH_ENABLED=false`.
2. For each active watch item, fetch current market price.
3. Insert snapshot and compute new state:
   - `below_or_equal_target` if `market <= target`
   - else `above_target`
4. Send Telegram alert only when:
   - `TELEGRAM_ALERTS_ENABLED=true`
   - state is `below_or_equal_target`
   - and either state just crossed from above, or cooldown elapsed.
5. Persist every send/suppress outcome to `alert_events`.

## Testing Plan

### Unit (Vitest)

1. Threshold evaluator behavior (crossing + cooldown).
2. Watch item validation and normalization.
3. Provider response mapping to canonical DTO.

### Integration

1. Watch item create/update/duplicate conflict behavior.
2. Refresh job writes snapshots and updates item current fields.
3. Alert generation/suppression outcome rows.

### E2E (Playwright)

1. Magic-link login flow.
2. Search/add single + set target.
3. Refresh path updates watchlist price.
4. Alert path produces expected event status.

### Accessibility

1. axe scan on login/watchlist/add flows.
2. Keyboard-only smoke tests.
3. Focus management and contrast checks.

## Done Criteria for Slice 1

1. User can track singles with target prices.
2. 6-hour refresh updates current prices.
3. Telegram threshold alerts fire correctly with cooldown protections.
4. Primary flows pass WCAG 2.2 AA checks.
5. Lint, tests, and build pass in CI.
