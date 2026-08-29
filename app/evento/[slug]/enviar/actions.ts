"use server";

import { isEventUploadOpen } from "@/lib/event-upload";
import { requireEventAccess } from "@/lib/event-access";

export async function checkUploadAvailability(eventSlug: string) {
  const { event } = await requireEventAccess(eventSlug);
  return isEventUploadOpen(event);
}
