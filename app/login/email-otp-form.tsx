"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function EmailOtpForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function sendCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);

    if (authError) {
      setError("Não foi possível enviar o código. Verifique o e-mail e tente novamente.");
      return;
    }

    setCodeSent(true);
    setMessage("Enviamos um código para o seu e-mail.");
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: token.trim(),
      type: "email",
    });

    if (authError) {
      setLoading(false);
      setError("Código inválido ou expirado. Tente novamente.");
      return;
    }

    router.replace(next);
    router.refresh();
  }

  function changeEmail() {
    setCodeSent(false);
    setToken("");
    setError("");
    setMessage("");
  }

  if (!codeSent) {
    return (
      <form onSubmit={sendCode}>
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
          className="mt-3 min-h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 min-h-14 w-full rounded-2xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-70"
        >
          {loading ? "Enviando..." : "Enviar código"}
        </button>

        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={verifyCode}>
      {message && <p className="mb-5 text-sm text-violet-200">{message}</p>}

      <label htmlFor="token" className="block text-sm font-semibold text-slate-200">
        Código recebido
      </label>
      <input
        id="token"
        name="token"
        type="text"
        inputMode="numeric"
        value={token}
        onChange={(event) => setToken(event.target.value)}
        autoComplete="one-time-code"
        required
        className="mt-3 min-h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-base tracking-[0.3em] text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-6 min-h-14 w-full rounded-2xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
        <button type="button" onClick={() => sendCode()} disabled={loading} className="font-semibold text-violet-300 hover:text-violet-200 disabled:opacity-60">
          Reenviar código
        </button>
        <button type="button" onClick={changeEmail} disabled={loading} className="font-semibold text-slate-400 hover:text-white disabled:opacity-60">
          Trocar e-mail
        </button>
      </div>
    </form>
  );
}
