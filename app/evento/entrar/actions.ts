"use server";

import { createAdminSession } from "@/lib/admin-auth";
import { createEventAccessSession } from "@/lib/event-access-session";

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
