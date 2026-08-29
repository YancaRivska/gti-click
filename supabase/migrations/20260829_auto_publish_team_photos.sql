-- GTI CLICK: fluxo interno da equipe, sem aprovação manual.
-- Execute uma vez no SQL Editor do Supabase.

update public.photo_uploads
set moderation_status = 'approved'
where moderation_status = 'pending';

alter table public.photo_uploads
  alter column moderation_status set default 'approved';

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
    and exists (
      select 1
      from public.event_consents consent
      where consent.user_id = (select auth.uid())
        and consent.event_id = photo_uploads.event_id
        and consent.consent_accepted is true
        and consent.consent_version = '1.0'
    )
  );
