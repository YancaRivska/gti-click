-- GTI CLICK: curtidas simples e encerramento automático dos envios.
-- Janela de envio: até 09/09/2026 23:59:59, horário de São Paulo.
-- Encerramento efetivo: 10/09/2026 00:00:00 America/Sao_Paulo (UTC-03).

create table if not exists public.photo_likes (
  photo_id uuid not null references public.photo_uploads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (photo_id, user_id)
);

create index if not exists photo_likes_photo_id_idx
  on public.photo_likes (photo_id);

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
        and photo.moderation_status <> 'rejected'
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
        and photo.moderation_status <> 'rejected'
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

-- A foto já entra aprovada no fluxo interno, mas somente antes do fechamento.
drop policy if exists "Users can register their own photos"
  on public.photo_uploads;
create policy "Users can register their own photos"
  on public.photo_uploads
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and moderation_status = 'approved'
    and storage_path like event_id || '/' || (select auth.uid())::text || '/%'
    and now() < timestamptz '2026-09-10 00:00:00-03:00'
    and exists (
      select 1
      from public.event_consents consent
      where consent.user_id = (select auth.uid())
        and consent.event_id = photo_uploads.event_id
        and consent.consent_accepted is true
        and consent.consent_version = '1.0'
    )
  );

drop policy if exists "Users can upload their own event photos"
  on storage.objects;
create policy "Users can upload their own event photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = 'aws-summit-sp-2026'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and now() < timestamptz '2026-09-10 00:00:00-03:00'
    and exists (
      select 1
      from public.event_consents consent
      where consent.user_id = (select auth.uid())
        and consent.event_id = 'aws-summit-sp-2026'
        and consent.consent_accepted is true
        and consent.consent_version = '1.0'
    )
  );
