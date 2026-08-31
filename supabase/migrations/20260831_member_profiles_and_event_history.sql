-- GTI CLICK: perfis opcionais e histórico pessoal de eventos.
-- Mantém o acesso anônimo atual; a conta permanente é opcional.

begin;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 60),
  instagram_handle text check (
    instagram_handle is null
    or char_length(instagram_handle) between 2 and 50
  ),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create table if not exists public.event_participations (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  access_role text not null default 'viewer'
    check (access_role in ('viewer', 'contributor')),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists event_participations_event_id_idx
  on public.event_participations (event_id);

alter table public.event_participations enable row level security;

revoke all on table public.event_participations from anon, authenticated;
grant select, insert, update on table public.event_participations to authenticated;

drop policy if exists "Users can read their own event history"
  on public.event_participations;
create policy "Users can read their own event history"
  on public.event_participations
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can register their own event history"
  on public.event_participations;
create policy "Users can register their own event history"
  on public.event_participations
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own event history"
  on public.event_participations;
create policy "Users can update their own event history"
  on public.event_participations
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Recupera o evento atual para quem já aceitou os termos antes desta migration.
insert into public.event_participations (user_id, event_id, access_role, joined_at)
select
  consent.user_id,
  consent.event_id,
  'viewer',
  coalesce(consent.consent_date, now())
from public.event_consents consent
where consent.consent_accepted is true
on conflict (user_id, event_id) do nothing;

notify pgrst, 'reload schema';

commit;
