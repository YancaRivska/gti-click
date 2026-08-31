insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'event-photos',
  'event-photos',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.photo_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  storage_path text not null unique,
  caption text check (caption is null or char_length(caption) <= 500),
  instagram_handle text check (
    instagram_handle is null
    or char_length(instagram_handle) <= 50
  ),
  moderation_status text not null default 'approved' check (
    moderation_status in ('pending', 'approved', 'rejected')
  ),
  created_at timestamptz not null default now()
);

alter table public.photo_uploads enable row level security;

revoke all on table public.photo_uploads from anon, authenticated;
grant select on table public.photo_uploads to authenticated;
grant delete on table public.photo_uploads to authenticated;
grant insert (
  user_id,
  event_id,
  storage_path,
  caption,
  instagram_handle
) on table public.photo_uploads to authenticated;

drop policy if exists "Consenting users can read event photos"
  on public.photo_uploads;
create policy "Consenting users can read event photos"
  on public.photo_uploads
  for select
  to authenticated
  using (
    moderation_status is distinct from 'rejected'
    and exists (
      select 1
      from public.event_consents consent
      where consent.user_id = (select auth.uid())
        and consent.event_id = photo_uploads.event_id
        and consent.consent_accepted is true
        and consent.consent_version = '1.0'
    )
  );

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

drop policy if exists "Users can delete their own photos"
  on public.photo_uploads;
create policy "Users can delete their own photos"
  on public.photo_uploads
  for delete
  to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.event_consents consent
      where consent.user_id = (select auth.uid())
        and consent.event_id = photo_uploads.event_id
        and consent.consent_accepted is true
        and consent.consent_version = '1.0'
    )
  );

drop policy if exists "Consenting users can upload their own event photos"
  on storage.objects;
create policy "Consenting users can upload their own event photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = 'aws-summit-sp-2026'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and lower(storage.extension(name)) = any (array['jpg', 'jpeg', 'png', 'webp'])
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

drop policy if exists "Consenting users can view event photos"
  on storage.objects;
create policy "Consenting users can view event photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = 'aws-summit-sp-2026'
    and exists (
      select 1
      from public.photo_uploads photo
      where photo.storage_path = name
        and photo.event_id = 'aws-summit-sp-2026'
        and photo.moderation_status is distinct from 'rejected'
    )
    and exists (
      select 1
      from public.event_consents consent
      where consent.user_id = (select auth.uid())
        and consent.event_id = 'aws-summit-sp-2026'
        and consent.consent_accepted is true
        and consent.consent_version = '1.0'
    )
  );

drop policy if exists "Users can delete their own event photos"
  on storage.objects;
create policy "Users can delete their own event photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'event-photos'
    and (storage.foldername(name))[1] = 'aws-summit-sp-2026'
    and (storage.foldername(name))[2] = (select auth.uid())::text
    and exists (
      select 1
      from public.event_consents consent
      where consent.user_id = (select auth.uid())
        and consent.event_id = 'aws-summit-sp-2026'
        and consent.consent_accepted is true
        and consent.consent_version = '1.0'
    )
  );
