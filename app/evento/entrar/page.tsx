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
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-7 pt-4 sm:px-6">
        <header className="flex items-center justify-between">
          <BackLink href="/">Início</BackLink>
          <GtiLogo size="compact" />
        </header>

        <main className="flex flex-1 flex-col justify-center py-5">
          <section className="entry-heading fade-up text-center">
            <span className="entry-context"><CameraIcon className="size-3.5" />Álbum exclusivo</span>
            <h1 className="mt-4 text-[2.7rem] leading-[0.92] font-black tracking-[-0.06em] text-white">
              Entre no evento
            </h1>
            <p className="mx-auto mt-3 max-w-[17rem] text-sm leading-relaxed text-slate-400">
              Digite o código e entra com a galera.
            </p>
          </section>

          <section className="access-card fade-up">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[0.64rem] font-black tracking-[0.15em] text-violet-300 uppercase">Acesso ao evento</span>
                <h2 className="mt-1.5 text-2xl font-black tracking-[-0.045em] text-white">Código do evento</h2>
              </div>
              <span className="access-icon"><LockIcon className="size-5" /></span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Use o código que você recebeu para abrir o álbum.</p>

            <form className="mt-5" onSubmit={handleSubmit} noValidate>
              <label htmlFor="event-code" className="sr-only">Código do evento</label>
              <div className="relative mt-2.5">
                <span className="pointer-events-none absolute top-1/2 left-4 grid size-8 -translate-y-1/2 place-items-center rounded-lg bg-violet-500/10 text-violet-200">
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
                  placeholder="Digite o código"
                  className="field min-h-15 pl-14 pr-4 font-black tracking-[0.06em] uppercase"
                />
              </div>

              {error && (
                <p id="event-code-error" role="alert" className="feedback-error mt-3">
                  <span className="size-1.5 rounded-full bg-red-300/80" />
                  Esse código não abriu nenhum evento. Confira e tente de novo.
                </p>
              )}

              {authError && (
                <p role="alert" className="feedback-error mt-3">Não foi possível entrar agora. Tente novamente.</p>
              )}

              <button type="submit" disabled={loading || !code.trim()} className="gradient-button mt-5 w-full text-base">
                {loading ? "Abrindo o álbum..." : "Entrar no evento"}
                {!loading && <ArrowRightIcon className="size-5" />}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/7 pt-4 text-[0.68rem] text-slate-500">
              <LockIcon className="size-3.5 text-violet-300" />
              Entrada privada e segura
            </div>
          </section>

          <p className="pt-6 text-center text-xs leading-relaxed text-slate-600">
            Os melhores momentos da galera, em um só lugar.
          </p>
        </main>
      </div>
    </AppShell>
  );
}
