-- GTI CLICK: atualização idempotente para instalações existentes.
-- Execute no SQL Editor do Supabase com uma conta administrativa.

alter table public.photo_uploads
  add column if not exists instagram_handle text,
  add column if not exists moderation_status text;

update public.photo_uploads
set moderation_status = 'approved'
where moderation_status is null;

alter table public.photo_uploads
  alter column moderation_status set default 'pending',
  alter column moderation_status set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'photo_uploads_moderation_status_check'
      and conrelid = 'public.photo_uploads'::regclass
  ) then
    alter table public.photo_uploads
      add constraint photo_uploads_moderation_status_check
      check (moderation_status in ('pending', 'approved', 'rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'photo_uploads_instagram_handle_length'
      and conrelid = 'public.photo_uploads'::regclass
  ) then
    alter table public.photo_uploads
      add constraint photo_uploads_instagram_handle_length
      check (
        instagram_handle is null
        or char_length(instagram_handle) <= 50
      );
  end if;
end
$$;

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
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

revoke all on table public.photo_uploads from anon, authenticated;
grant select, delete on table public.photo_uploads to authenticated;
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
    (moderation_status = 'approved' or user_id = (select auth.uid()))
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
    and moderation_status = 'pending'
    and storage_path like event_id || '/' || (select auth.uid())::text || '/%'
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
        and (
          photo.moderation_status = 'approved'
          or photo.user_id = (select auth.uid())
        )
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
