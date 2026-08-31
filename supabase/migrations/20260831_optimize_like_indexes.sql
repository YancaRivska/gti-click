-- GTI CLICK: remove índice redundante e otimiza o histórico de curtidas.

begin;

drop index if exists public.photo_likes_photo_id_idx;

create index if not exists photo_likes_user_id_idx
  on public.photo_likes (user_id);

commit;
