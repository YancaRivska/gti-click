alter table public.photo_uploads
  add column if not exists instagram_handle text
  check (
    instagram_handle is null
    or char_length(instagram_handle) <= 50
  );

grant insert (instagram_handle)
  on table public.photo_uploads to authenticated;
