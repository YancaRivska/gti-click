-- GTI CLICK: ativa curtidas persistentes no álbum publicado.
-- Idempotente: pode ser executada novamente sem duplicar tabela ou políticas.

begin;

create table if not exists public.photo_likes (
  photo_id uuid not null references public.photo_uploads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (photo_id, user_id)
);

create index if not exists photo_likes_photo_id_idx
  on public.photo_likes (photo_id);

-- A galeria e o Meu GTI filtram uploads por usuário com frequência.
create index if not exists photo_uploads_user_id_idx
  on public.photo_uploads (user_id);

alter table public.photo_likes enable row level security;

revoke all on table public.photo_likes from anon, authenticated;
grant select, insert, delete on table public.photo_likes to authenticated;

drop policy if exists "Participants can read event photo likes"
  on public.photo_likes;
create policy "Participants can read event photo likes"
  on public.photo_likes
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.photo_uploads photo
      where photo.id = photo_likes.photo_id
        and photo.moderation_status is distinct from 'rejected'
        and exists (
          select 1
          from public.event_consents consent
          where consent.user_id = (select auth.uid())
            and consent.event_id = photo.event_id
            and consent.consent_accepted is true
            and consent.consent_version = '1.0'
        )
    )
  );

drop policy if exists "Participants can like event photos"
  on public.photo_likes;
create policy "Participants can like event photos"
  on public.photo_likes
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.photo_uploads photo
      where photo.id = photo_likes.photo_id
        and photo.moderation_status is distinct from 'rejected'
        and exists (
          select 1
          from public.event_consents consent
          where consent.user_id = (select auth.uid())
            and consent.event_id = photo.event_id
            and consent.consent_accepted is true
            and consent.consent_version = '1.0'
        )
    )
  );

drop policy if exists "Participants can remove their own likes"
  on public.photo_likes;
create policy "Participants can remove their own likes"
  on public.photo_likes
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- Atualiza imediatamente o cache de schema usado pela API do Supabase.
notify pgrst, 'reload schema';

commit;
