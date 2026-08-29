"use server";

import { createAdminSession } from "@/lib/admin-auth";

export async function enterAdmin(code: string) {
  return createAdminSession(code);
}
