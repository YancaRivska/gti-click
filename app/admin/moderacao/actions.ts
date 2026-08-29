"use server";

import { redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { hasAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

const EVENT_SLUG = "aws-summit-sp-2026";
const PHOTO_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getAuthorizedPhoto(formData: FormData) {
  if (!(await hasAdminSession())) {
    redirect("/evento/entrar");
  }

  const event = getEventBySlug(EVENT_SLUG);
  const photoId = formData.get("photoId");

  if (!event || typeof photoId !== "string" || !PHOTO_ID_PATTERN.test(photoId)) {
    redirect("/admin/moderacao?error=invalid");
  }

  return { event, photoId };
}

export async function approvePendingPhoto(formData: FormData) {
  const { event, photoId } = await getAuthorizedPhoto(formData);
  const admin = createAdminClient();
  const { error } = await admin
    .from("photo_uploads")
    .update({ moderation_status: "approved" })
    .eq("id", photoId)
    .eq("event_id", event.id)
    .eq("moderation_status", "pending");

  redirect(error ? "/admin/moderacao?error=approve" : "/admin/moderacao");
}

export async function deletePendingPhoto(formData: FormData) {
  const { event, photoId } = await getAuthorizedPhoto(formData);
  const admin = createAdminClient();
  const { data: photo, error: photoError } = await admin
    .from("photo_uploads")
    .select("storage_path")
    .eq("id", photoId)
    .eq("event_id", event.id)
    .eq("moderation_status", "pending")
    .maybeSingle();

  if (photoError || !photo) {
    redirect("/admin/moderacao?error=delete");
  }

  const { error: storageError } = await admin.storage
    .from("event-photos")
    .remove([photo.storage_path]);

  if (storageError) {
    redirect("/admin/moderacao?error=delete");
  }

  const { error: recordError } = await admin
    .from("photo_uploads")
    .delete()
    .eq("id", photoId)
    .eq("event_id", event.id)
    .eq("moderation_status", "pending");

  redirect(recordError ? "/admin/moderacao?error=delete" : "/admin/moderacao");
}
