"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function GoogleLoginButton({ next }: { next: string }) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setError(false);
    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (authError) {
      setError(true);
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 font-bold text-slate-950 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-70"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5">
          <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.91h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.4Z" />
          <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.97-3.39.97-2.61 0-4.82-1.77-5.61-4.14H3.05v2.62A10 10 0 0 0 12 22Z" />
          <path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.08 12c0-.65.11-1.28.31-1.86V7.52H3.05A10 10 0 0 0 2 12c0 1.61.38 3.14 1.05 4.48l3.34-2.62Z" />
          <path fill="#EA4335" d="M12 6c1.47 0 2.78.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.95 5.52l3.34 2.62C7.18 7.77 9.39 6 12 6Z" />
        </svg>
        {loading ? "Abrindo o Google..." : "Continuar com Google"}
      </button>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          Não foi possível iniciar o login. Tente novamente.
        </p>
      )}
    </>
  );
}
