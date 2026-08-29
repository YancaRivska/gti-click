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
  LockIcon,
  SparklesIcon,
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
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pb-7 pt-4 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <BackLink href="/">Início</BackLink>
          <GtiLogo size="default" />
        </header>

        <main className="entry-layout flex flex-1 flex-col justify-center py-5 lg:grid lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-8 lg:py-10">
          <section className="entry-stage">
            <div className="entry-stage-copy">
              <span className="eyebrow">
                <SparklesIcon className="size-3.5" />
                Álbum exclusivo
              </span>
              <h1 className="mt-4 max-w-xs text-[2.3rem] leading-[0.92] font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
                Seu próximo <span className="text-gradient">click</span> começa aqui.
              </h1>
              <p className="mt-4 max-w-60 text-sm leading-relaxed text-slate-400 sm:max-w-xs sm:text-base">
                Entre no álbum oficial do evento e registre tudo com a galera.
              </p>
            </div>

            <div className="entry-mascot">
              <Image
                src="/assets/gti-click/mascot-phone-seated.jpg"
                alt="Mascote GTI CLICK pronto para entrar no evento"
                fill
                priority
                sizes="(max-width: 1024px) 13rem, 24rem"
                className="object-contain object-bottom mix-blend-screen"
              />
            </div>
            <span className="entry-camera-bubble" aria-hidden="true"><CameraIcon className="size-5" /></span>
          </section>

          <section className="access-card fade-up">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-[0.64rem] font-black tracking-[0.15em] text-violet-300 uppercase">Acesso ao evento</span>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">Entre com a galera</h2>
              </div>
              <span className="access-icon"><LockIcon className="size-5" /></span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">Digite o código que você recebeu para abrir o álbum.</p>

            <form className="mt-6" onSubmit={handleSubmit} noValidate>
              <label htmlFor="event-code" className="text-sm font-bold text-slate-200">Código do evento</label>
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
                  className="field min-h-16 pl-14 pr-4 font-black tracking-[0.06em] uppercase"
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
              Código validado antes de criar seu acesso
            </div>
          </section>
        </main>
      </div>
    </AppShell>
  );
}
