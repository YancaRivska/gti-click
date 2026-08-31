"use server";

import { redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { CONSENT_VERSION } from "@/lib/consent";
import { getEventAccessRole } from "@/lib/event-access-session";
import { createClient } from "@/lib/supabase/server";

export async function acceptConsent(formData: FormData) {
  const slug = formData.get("eventSlug");
  const accepted = formData.get("consent") === "on";
  const event = typeof slug === "string" ? getEventBySlug(slug) : undefined;

  if (!event) {
    redirect("/evento/entrar");
  }

  if (!(await getEventAccessRole(event.slug))) {
    redirect("/evento/entrar");
  }

  const consentPath = `/evento/${event.slug}/aceite`;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/evento/entrar");
  }

  if (!accepted) {
    redirect(`${consentPath}?error=required`);
  }

  const { error } = await supabase.from("event_consents").insert({
    user_id: user.id,
    event_id: event.id,
    consent_accepted: true,
    consent_version: CONSENT_VERSION,
  });

  if (error && error.code !== "23505") {
    redirect(`${consentPath}?error=save`);
  }

  redirect(`/evento/${event.slug}`);
}
