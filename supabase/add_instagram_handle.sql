alter table public.photo_uploads
  add column if not exists instagram_handle text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
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

grant insert (instagram_handle)
  on table public.photo_uploads to authenticated;
