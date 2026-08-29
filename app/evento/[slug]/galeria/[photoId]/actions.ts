"use server";

import { redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createAdminSession, hasAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "event-photos";
const PHOTO_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function deleteOwnPhoto(formData: FormData) {
  const slug = formData.get("eventSlug");
  const photoId = formData.get("photoId");
  const source = formData.get("source");
  const adminCode = formData.get("adminCode");
  const event = typeof slug === "string" ? getEventBySlug(slug) : undefined;

  if (
    !event ||
    typeof photoId !== "string" ||
    !PHOTO_ID_PATTERN.test(photoId)
  ) {
    redirect("/evento/entrar");
  }

  const detailPath = `/evento/${event.slug}/galeria/${photoId}`;
  const errorPath = source === "card"
    ? `/evento/${event.slug}/galeria?error=delete`
    : `${detailPath}?error=delete`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/evento/entrar");
  }

  if (!(await hasEventConsent(supabase, user.id, event.id))) {
    redirect(`/evento/${event.slug}/aceite`);
  }

  const { data: photo, error: photoError } = await supabase
    .from("photo_uploads")
    .select("user_id, storage_path")
    .eq("id", photoId)
    .eq("event_id", event.id)
    .maybeSingle();

  if (photoError || !photo || !photo.storage_path.startsWith(`${event.slug}/`)) {
    redirect(errorPath);
  }

  const ownsPhoto = photo.user_id === user.id && photo.storage_path.startsWith(`${event.slug}/${user.id}/`);

  if (!ownsPhoto) {
    let adminAuthorized = await hasAdminSession();

    if (!adminAuthorized && typeof adminCode === "string") {
      adminAuthorized = await createAdminSession(adminCode);
    }

    if (!adminAuthorized) {
      redirect(errorPath);
    }

    const admin = createAdminClient();
    const { error: storageError } = await admin.storage
      .from(BUCKET)
      .remove([photo.storage_path]);

    if (storageError) {
      redirect(errorPath);
    }

    const { data: deletedRecord, error: recordError } = await admin
      .from("photo_uploads")
      .delete()
      .eq("id", photoId)
      .eq("event_id", event.id)
      .select("id")
      .maybeSingle();

    if (recordError || !deletedRecord) {
      redirect(errorPath);
    }

    redirect(`/evento/${event.slug}/galeria?deleted=1`);
  }

  const { error: storageError } = await supabase.storage
    .from(BUCKET)
    .remove([photo.storage_path]);

  if (storageError) {
    redirect(errorPath);
  }

  const { data: deletedRecord, error: recordError } = await supabase
    .from("photo_uploads")
    .delete()
    .eq("id", photoId)
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (recordError || !deletedRecord) {
    redirect(errorPath);
  }

  redirect(`/evento/${event.slug}/galeria?deleted=1`);
}
