"use server";

import { isEventUploadOpen } from "@/lib/event-upload";
import { requireEventAccess } from "@/lib/event-access";

export async function checkUploadAvailability(eventSlug: string) {
  const { event, role } = await requireEventAccess(eventSlug);
  return role === "contributor" && isEventUploadOpen(event);
}
