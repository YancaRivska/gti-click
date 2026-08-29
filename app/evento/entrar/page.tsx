"use client";

import Image from "next/image";
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
  ShieldIcon,
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
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-5 pb-7 pt-5 sm:px-8">
        <header className="flex items-center justify-between">
          <BackLink href="/">Início</BackLink>
          <GtiLogo size="compact" />
        </header>

        <main className="grid flex-1 items-center gap-7 py-6 lg:grid-cols-[.96fr_1.04fr] lg:gap-14">
          <section className="brand-stage relative mx-auto flex min-h-[20rem] w-full max-w-md flex-col items-center justify-end text-center sm:min-h-[25rem] lg:min-h-[36rem]">
            <GtiLogo size="hero" />
            <div className="relative mt-[-1.5rem] h-52 w-full sm:h-72 lg:h-80">
              <Image
                src="/assets/gti-click/mascot-phone-seated.jpg"
                alt="Mascote GTI CLICK com celular"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 27rem"
                className="float-soft object-contain object-bottom mix-blend-screen drop-shadow-[0_0_32px_rgba(217,70,239,.2)]"
              />
            </div>
            <p className="relative z-10 -mt-3 max-w-xs text-sm leading-relaxed text-slate-400">
              Os melhores momentos da galera, em um só lugar.
            </p>
          </section>

          <section className="entry-panel fade-up mx-auto w-full max-w-md p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[0.65rem] font-black tracking-[0.14em] text-violet-300 uppercase">Acesso ao álbum</span>
                <h1 className="mt-2 text-3xl leading-tight font-black tracking-[-0.045em] text-white sm:text-4xl">Entre no evento</h1>
              </div>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl border border-violet-300/15 bg-violet-500/10 text-violet-200">
                <CameraIcon className="size-5" />
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-400">Digite o código e entra com a galera.</p>

            <form className="mt-6" onSubmit={handleSubmit} noValidate>
              <label htmlFor="event-code" className="text-sm font-bold text-slate-200">Código do evento</label>
              <div className="relative mt-2.5">
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
                  className="field min-h-15 px-4 pr-13 font-bold tracking-[0.05em] uppercase"
                />
                <CameraIcon className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-violet-300/70" />
              </div>

              {error && (
                <p id="event-code-error" role="alert" className="mt-3 flex items-center gap-2 rounded-xl border border-red-300/10 bg-red-400/[0.055] px-3 py-2.5 text-sm text-red-200/85">
                  <span className="size-1.5 rounded-full bg-red-300/80" />Código do evento inválido.
                </p>
              )}

              {authError && (
                <p role="alert" className="mt-3 rounded-xl border border-red-300/10 bg-red-400/[0.055] px-3 py-2.5 text-sm text-red-200/85">
                  Não foi possível entrar agora. Tente novamente.
                </p>
              )}

              <button type="submit" disabled={loading || !code.trim()} className="gradient-button mt-5 w-full text-base">
                {loading ? "Entrando..." : "Entrar no evento"}
                {!loading && <ArrowRightIcon className="size-5" />}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/7 pt-4 text-[0.68rem] text-slate-600">
              <ShieldIcon className="size-3.5 text-violet-300" />
              Acesso privado para a galera do evento
            </div>
          </section>
        </main>
      </div>
    </AppShell>
  );
}
