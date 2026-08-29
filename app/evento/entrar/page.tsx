"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getEventByCode } from "@/data/events";
import { createClient } from "@/lib/supabase/browser";
import { enterAdmin } from "./actions";

export default function EventEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedEvent = getEventByCode(code.trim());

    if (!selectedEvent) {
      setLoading(true);
      const adminAccess = await enterAdmin(code);

      if (adminAccess) {
        router.push("/admin/moderacao");
        router.refresh();
        return;
      }

      setLoading(false);
      setError(true);
      return;
    }

    setAuthError(false);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const { error: signInError } = await supabase.auth.signInAnonymously();

      if (signInError) {
        setAuthError(true);
        setLoading(false);
        return;
      }
    }

    router.push(`/evento/${selectedEvent.slug}`);
    router.refresh();
  }

  return (
    <main className="home-shell relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-10">
      <div className="lens" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#0b0d1a]/90 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
        <Link
          href="/"
          className="text-xs font-bold tracking-[0.18em] text-violet-300"
        >
          ← GTI CLICK
        </Link>

        <h1 className="mt-8 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Entre no evento
        </h1>

        <form className="mt-8" onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="event-code"
            className="block text-sm font-semibold text-slate-200"
          >
            Código do evento
          </label>
          <input
            id="event-code"
            name="event-code"
            type="text"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              setError(false);
              setAuthError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? "event-code-error" : undefined}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="mt-3 min-h-14 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
          />

          {error && (
            <p id="event-code-error" role="alert" className="mt-3 text-sm text-red-300">
              Código do evento inválido.
            </p>
          )}

          {authError && (
            <p role="alert" className="mt-3 text-sm text-red-300">
              Não foi possível entrar no evento. Tente novamente.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 min-h-14 w-full rounded-2xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 disabled:cursor-wait disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Continuar"}
          </button>
        </form>
      </section>
    </main>
  );
}
