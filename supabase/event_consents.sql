create table if not exists public.event_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  consent_accepted boolean not null,
  consent_version text not null,
  consent_date timestamptz not null default now(),
  unique (user_id, event_id, consent_version)
);

alter table public.event_consents enable row level security;

revoke all on table public.event_consents from anon, authenticated;
grant select on table public.event_consents to authenticated;
grant delete on table public.event_consents to authenticated;
grant insert (user_id, event_id, consent_accepted, consent_version)
  on table public.event_consents to authenticated;

drop policy if exists "Users can read their own consents"
  on public.event_consents;
create policy "Users can read their own consents"
  on public.event_consents
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own consents"
  on public.event_consents;
create policy "Users can create their own consents"
  on public.event_consents
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and consent_accepted is true
    and consent_version = '1.0'
  );

drop policy if exists "Users can delete their own consents"
  on public.event_consents;
create policy "Users can delete their own consents"
  on public.event_consents
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
