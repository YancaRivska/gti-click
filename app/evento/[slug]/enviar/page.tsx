import { redirect } from "next/navigation";
import { requireEventAccess } from "@/lib/event-access";
import { isEventUploadOpen } from "@/lib/event-upload";
import { PhotoUploadForm } from "./photo-upload-form";

export default async function PhotoUploadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, role, user } = await requireEventAccess(slug);

  if (role !== "contributor") {
    redirect(`/evento/${event.slug}?access=viewer`);
  }

  return (
    <PhotoUploadForm
      eventId={event.id}
      eventName={event.nome}
      eventSlug={event.slug}
      userId={user.id}
      uploadClosesAt={event.uploadClosesAt}
      initialUploadOpen={isEventUploadOpen(event)}
    />
  );
}
