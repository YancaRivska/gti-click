import { NextResponse } from "next/server";
import { safeReturnPath } from "@/lib/return-path";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeReturnPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? "https";
      const destination =
        process.env.NODE_ENV === "development" || !forwardedHost
          ? `${origin}${next}`
          : `${forwardedProtocol}://${forwardedHost}${next}`;

      const response = NextResponse.redirect(destination);
      response.headers.set("Cache-Control", "private, no-store");
      return response;
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "link");
  loginUrl.searchParams.set("next", next);
  return NextResponse.redirect(loginUrl);
}
