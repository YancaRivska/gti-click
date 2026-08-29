"use server";

import { revalidatePath } from "next/cache";
import { requireEventAccess } from "@/lib/event-access";
import { createAdminClient } from "@/lib/supabase/admin";

export type TogglePhotoLikeResult =
  | { ok: true; liked: boolean; count: number }
  | { ok: false; message: string };

export async function togglePhotoLike(
  eventSlug: string,
  photoId: string,
): Promise<TogglePhotoLikeResult> {
  try {
    const { event, supabase, user } = await requireEventAccess(eventSlug);
    const { data: photo, error: photoError } = await supabase
      .from("photo_uploads")
      .select("id")
      .eq("id", photoId)
      .eq("event_id", event.id)
      .neq("moderation_status", "rejected")
      .maybeSingle();

    if (photoError || !photo) {
      return { ok: false, message: "Essa foto não está disponível." };
    }

    const admin = createAdminClient();

    const { data: currentLike, error: currentLikeError } = await admin
      .from("photo_likes")
      .select("photo_id")
      .eq("photo_id", photo.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (currentLikeError) {
      return { ok: false, message: "Não foi possível atualizar a curtida." };
    }

    const liked = !currentLike;
    const mutation = currentLike
      ? admin
          .from("photo_likes")
          .delete()
          .eq("photo_id", photo.id)
          .eq("user_id", user.id)
      : admin.from("photo_likes").insert({
          photo_id: photo.id,
          user_id: user.id,
        });

    const { error: mutationError } = await mutation;

    if (mutationError) {
      return { ok: false, message: "Não foi possível atualizar a curtida." };
    }

    const { count, error: countError } = await admin
      .from("photo_likes")
      .select("photo_id", { count: "exact", head: true })
      .eq("photo_id", photo.id);

    revalidatePath(`/evento/${event.slug}/galeria`);
    revalidatePath(`/evento/${event.slug}/galeria/${photo.id}`);

    return {
      ok: true,
      liked,
      count: countError ? (liked ? 1 : 0) : (count ?? 0),
    };
  } catch {
    return { ok: false, message: "Não foi possível atualizar a curtida." };
  }
}
