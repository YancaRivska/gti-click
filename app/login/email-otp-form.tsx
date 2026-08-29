"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function EmailOtpForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function sendLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const emailRedirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo },
    });

    setLoading(false);

    if (authError) {
      setError("Não foi possível enviar o link. Verifique o e-mail e tente novamente.");
      return;
    }

    setLinkSent(true);
  }

  return (
    <form onSubmit={sendLink}>
      <label htmlFor="email" className="block text-sm font-semibold text-slate-200">
        Seu e-mail
      </label>
      <input
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        disabled={linkSent}
        className="mt-3 min-h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 disabled:opacity-60"
      />

      {!linkSent && (
        <button
          type="submit"
          disabled={loading}
          className="mt-6 min-h-14 w-full rounded-2xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Enviando..." : "Enviar link de acesso"}
        </button>
      )}

      {linkSent && (
        <p role="status" className="mt-5 text-sm text-violet-200">
          Link enviado! Confira seu e-mail para continuar.
        </p>
      )}

      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
    </form>
  );
}
