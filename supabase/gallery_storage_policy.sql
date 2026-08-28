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
