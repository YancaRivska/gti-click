alter table public.photo_uploads
  add column if not exists moderation_status text;

-- Somente registros realmente legados, sem status, são preservados na galeria.
update public.photo_uploads
set moderation_status = 'approved'
where moderation_status is null;

alter table public.photo_uploads
  alter column moderation_status set default 'pending',
  alter column moderation_status set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'photo_uploads_moderation_status_check'
      and conrelid = 'public.photo_uploads'::regclass
  ) then
    alter table public.photo_uploads
      add constraint photo_uploads_moderation_status_check
      check (moderation_status in ('pending', 'approved', 'rejected'));
  end if;
end
$$;
