"use server";

import { createAdminSession } from "@/lib/admin-auth";
import {
  createEventAccessSession,
  getEventAccessRole,
} from "@/lib/event-access-session";
import { getEventBySlug } from "@/data/events";
import { createClient } from "@/lib/supabase/server";

export type EnterWithCodeResult =
  | { kind: "admin" }
  | { kind: "event"; slug: string }
  | { kind: "invalid" };

export async function enterWithCode(code: string): Promise<EnterWithCodeResult> {
  if (await createAdminSession(code)) {
    return { kind: "admin" };
  }

  const access = await createEventAccessSession(code);

  if (!access) {
    return { kind: "invalid" };
  }

  return { kind: "event", slug: access.event.slug };
}

export async function registerEventParticipation(eventSlug: string) {
  const event = getEventBySlug(eventSlug);
  const role = event ? await getEventAccessRole(event.slug) : null;

  if (!event || !role) {
    return false;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase.from("event_participations").upsert(
    {
      user_id: user.id,
      event_id: event.id,
      access_role: role,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,event_id" },
  );

  // A migration pode ainda não ter sido aplicada; isso não bloqueia o álbum.
  return !error;
}
