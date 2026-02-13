alter table watch_items enable row level security;
alter table price_snapshots enable row level security;
alter table alert_events enable row level security;
alter table job_runs enable row level security;

create policy "watch_items_select_own"
on watch_items
for select
using (auth.uid() = user_id);

create policy "watch_items_insert_own"
on watch_items
for insert
with check (auth.uid() = user_id);

create policy "watch_items_update_own"
on watch_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "watch_items_delete_own"
on watch_items
for delete
using (auth.uid() = user_id);

create policy "price_snapshots_select_own"
on price_snapshots
for select
using (
  exists (
    select 1
    from watch_items wi
    where wi.id = price_snapshots.watch_item_id
      and wi.user_id = auth.uid()
  )
);

create policy "alert_events_select_own"
on alert_events
for select
using (
  exists (
    select 1
    from watch_items wi
    where wi.id = alert_events.watch_item_id
      and wi.user_id = auth.uid()
  )
);

create policy "job_runs_service_role_only"
on job_runs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
