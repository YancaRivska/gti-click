import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export const CONSENT_VERSION = "1.0";

export async function hasEventConsent(
  supabase: SupabaseClient,
  userId: string,
  eventId: string,
) {
  const { data } = await supabase
    .from("event_consents")
    .select("id")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .eq("consent_accepted", true)
    .eq("consent_version", CONSENT_VERSION)
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}
