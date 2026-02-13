create extension if not exists "pgcrypto";

create type provider_t as enum ('tcgplayer');
create type watch_status_t as enum ('active', 'paused', 'archived');
create type alert_state_t as enum ('unknown', 'above_target', 'below_or_equal_target');
create type alert_delivery_t as enum ('sent', 'failed', 'suppressed_toggle', 'suppressed_cooldown');

create table if not exists watch_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider provider_t not null default 'tcgplayer',
  external_card_id text not null,
  card_name text not null,
  set_name text,
  set_code text,
  collector_number text,
  finish text not null default 'nonfoil',
  condition text not null default 'NM',
  currency char(3) not null default 'USD',
  target_price numeric(10,2) not null check (target_price > 0),
  current_market_price numeric(10,2),
  last_checked_at timestamptz,
  alert_state alert_state_t not null default 'unknown',
  last_alerted_at timestamptz,
  alert_cooldown_hours int not null default 24 check (alert_cooldown_hours between 1 and 168),
  status watch_status_t not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider, external_card_id, finish, condition)
);

create index if not exists watch_items_user_status_idx on watch_items(user_id, status);
create index if not exists watch_items_last_checked_idx on watch_items(last_checked_at);

create table if not exists price_snapshots (
  id uuid primary key default gen_random_uuid(),
  watch_item_id uuid not null references watch_items(id) on delete cascade,
  observed_at timestamptz not null default now(),
  market_price numeric(10,2) not null,
  currency char(3) not null default 'USD',
  provider provider_t not null default 'tcgplayer',
  raw_payload jsonb not null
);

create index if not exists price_snapshots_watch_item_observed_idx
  on price_snapshots(watch_item_id, observed_at desc);

create table if not exists alert_events (
  id uuid primary key default gen_random_uuid(),
  watch_item_id uuid not null references watch_items(id) on delete cascade,
  snapshot_id uuid references price_snapshots(id) on delete set null,
  triggered_at timestamptz not null default now(),
  trigger_price numeric(10,2) not null,
  target_price numeric(10,2) not null,
  delivery alert_delivery_t not null,
  error_message text
);

create index if not exists alert_events_watch_item_triggered_idx
  on alert_events(watch_item_id, triggered_at desc);

create table if not exists job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  status text not null check (status in ('running', 'success', 'failed')),
  processed_count int not null default 0,
  updated_count int not null default 0,
  alerted_count int not null default 0,
  failed_count int not null default 0,
  error_summary text
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists watch_items_set_updated_at on watch_items;
create trigger watch_items_set_updated_at
before update on watch_items
for each row
execute function set_updated_at();
