"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { getEventByCode } from "@/data/events";
import { createClient } from "@/lib/supabase/browser";
import {
  AppShell,
  ArrowRightIcon,
  BackLink,
  CameraIcon,
  GtiLogo,
  LockIcon,
} from "@/components/gti-ui";
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
    <AppShell className="entry-app">
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pb-7 pt-5">
        <header><BackLink href="/">Início</BackLink></header>

        <main className="entry-reference flex flex-1 flex-col justify-center py-8">
          <section className="fade-up text-center">
            <GtiLogo size="default" />
            <h1 className="mt-8 text-[2rem] leading-none font-black tracking-[-0.045em] text-white">Entre no evento</h1>
            <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-slate-400">Digite o código e entra com a galera.</p>

            <form className="mt-8" onSubmit={handleSubmit} noValidate>
              <label htmlFor="event-code" className="sr-only">Código do evento</label>
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 grid size-8 -translate-y-1/2 place-items-center text-violet-300">
                  <CameraIcon className="size-4" />
                </span>
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
                  placeholder="Digite o código do evento"
                  className="field min-h-14 pl-14 pr-4 text-sm font-semibold uppercase"
                />
              </div>

              {error && (
                <p id="event-code-error" role="alert" className="feedback-error mt-3">
                  <span className="size-1.5 rounded-full bg-red-300/80" />
                  Código do evento inválido.
                </p>
              )}

              {authError && <p role="alert" className="feedback-error mt-3">Não foi possível entrar agora. Tente novamente.</p>}

              <button type="submit" disabled={loading || !code.trim()} className="gradient-button mt-4 w-full text-sm">
                {loading ? "Abrindo o álbum..." : "Entrar no evento"}
                {!loading && <ArrowRightIcon className="size-4.5" />}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-2 text-[0.68rem] text-slate-500">
              <LockIcon className="size-3.5 text-violet-300" />Entrada privada e segura
            </div>
          </section>
        </main>
      </div>
    </AppShell>
  );
}
