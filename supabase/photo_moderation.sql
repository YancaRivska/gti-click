alter table public.photo_uploads
  add column moderation_status text not null default 'pending'
  constraint photo_uploads_moderation_status_check
  check (moderation_status in ('pending', 'approved', 'rejected'));

update public.photo_uploads
set moderation_status = 'approved';
