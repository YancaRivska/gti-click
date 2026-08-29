import type { Event } from "@/data/events";

type UploadWindowEvent = Pick<Event, "uploadsEnabled" | "uploadClosesAt">;

export function isEventUploadOpen(
  event: UploadWindowEvent,
  now: Date | number = Date.now(),
) {
  const currentTime = typeof now === "number" ? now : now.getTime();
  const closesAt = new Date(event.uploadClosesAt).getTime();

  return event.uploadsEnabled && Number.isFinite(closesAt) && currentTime < closesAt;
}
