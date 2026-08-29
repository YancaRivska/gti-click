import { requireEventAccess } from "@/lib/event-access";
import { PhotoUploadForm } from "./photo-upload-form";

export default async function PhotoUploadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { event, user } = await requireEventAccess(slug);

  return (
    <PhotoUploadForm
      eventId={event.id}
      eventName={event.nome}
      eventSlug={event.slug}
      userId={user.id}
    />
  );
}
