"use server";

import { redirect } from "next/navigation";
import { clearEventAccessSession } from "@/lib/event-access-session";
import { createClient } from "@/lib/supabase/server";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  await clearEventAccessSession();
  redirect("/evento/entrar");
}
