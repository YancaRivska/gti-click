"use server";

import { redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { CONSENT_VERSION } from "@/lib/consent";
import { createClient } from "@/lib/supabase/server";

export async function revokeConsent(formData: FormData) {
  const slug = formData.get("eventSlug");
  const event = typeof slug === "string" ? getEventBySlug(slug) : undefined;

  if (!event) {
    redirect("/evento/entrar");
  }

  const eventPath = `/evento/${event.slug}`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(eventPath)}`);
  }

  const { error } = await supabase
    .from("event_consents")
    .delete()
    .eq("user_id", user.id)
    .eq("event_id", event.id)
    .eq("consent_version", CONSENT_VERSION);

  if (error) {
    redirect(`${eventPath}?error=revoke`);
  }

  redirect(`/evento/${event.slug}/aceite`);
}
