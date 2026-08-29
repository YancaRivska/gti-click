import "server-only";

import { notFound, redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createClient } from "@/lib/supabase/server";

export async function requireEventAccess(slug: string) {
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

  return { event, supabase, user };
}
