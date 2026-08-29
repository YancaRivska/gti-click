import { notFound, redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createClient } from "@/lib/supabase/server";
import { PhotoUploadForm } from "./photo-upload-form";

export default async function PhotoUploadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

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

  return (
    <PhotoUploadForm
      eventId={event.id}
      eventName={event.nome}
      eventSlug={event.slug}
      userId={user.id}
    />
  );
}
