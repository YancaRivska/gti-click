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
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between">
          <GtiLogo />
          <span className="hidden text-xs text-slate-500 sm:block">Acesso seguro ao evento</span>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20">
          <div className="hidden max-w-lg lg:block">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Seu evento começa aqui
            </span>
            <h1 className="mt-6 text-5xl leading-[0.95] font-black tracking-[-0.05em] text-white">
              Um código.
              <span className="text-gradient block">Todas as memórias.</span>
            </h1>
            <p className="mt-6 max-w-md leading-relaxed text-slate-400">
              Entre no álbum privado do seu evento para publicar e acompanhar os clicks da galera.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="soft-panel rounded-2xl p-4">
                <CameraIcon className="size-5 text-violet-300" />
                <p className="mt-3 text-sm font-bold text-white">Clicks em um só lugar</p>
              </div>
              <div className="soft-panel rounded-2xl p-4">
                <ShieldIcon className="size-5 text-violet-300" />
                <p className="mt-3 text-sm font-bold text-white">Acesso privado</p>
              </div>
            </div>
            <div className="relative mt-5 h-64 overflow-hidden rounded-3xl border border-violet-300/10 bg-violet-500/[0.04]">
              <Image src="/assets/gti-click/mascot-phone.jpg" alt="Mascote GTI CLICK registrando o evento com o celular" fill sizes="28rem" className="object-contain object-bottom mix-blend-screen" priority />
            </div>
          </div>

          <section className="glass-panel mx-auto w-full max-w-md rounded-[1.75rem] p-6 sm:p-8">
            <BackLink href="/">Voltar ao início</BackLink>

            <div className="relative mt-3 h-32 overflow-hidden lg:hidden">
              <Image src="/assets/gti-click/mascot-phone-seated.jpg" alt="Mascote GTI CLICK com celular" fill sizes="10rem" className="object-contain object-right mix-blend-screen" priority />
            </div>

            <div className="mt-4 flex items-start justify-between gap-4 lg:mt-8">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-violet-300 uppercase">Acesso ao álbum</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">Entre no evento</h2>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
                <SparklesIcon className="size-6" />
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Digite o código compartilhado pela organização para continuar.
            </p>

            <form className="mt-8" onSubmit={handleSubmit} noValidate>
              <label htmlFor="event-code" className="block text-sm font-bold text-slate-200">
                Código do evento
              </label>
              <div className="relative mt-3">
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
                  aria-describedby={error ? "event-code-error" : "event-code-help"}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="Digite o código"
                  className="field min-h-16 px-5 pr-14 font-bold tracking-[0.08em] uppercase"
                />
                <CameraIcon className="pointer-events-none absolute top-1/2 right-5 size-5 -translate-y-1/2 text-violet-300" />
              </div>
              <p id="event-code-help" className="mt-2 text-xs text-slate-600">Pode digitar com letras maiúsculas ou minúsculas.</p>

              {error && (
                <p id="event-code-error" role="alert" className="mt-3 rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-sm text-red-200">
                  Código do evento inválido.
                </p>
              )}

              {authError && (
                <p role="alert" className="mt-3 rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-sm text-red-200">
                  Não foi possível entrar no evento. Tente novamente.
                </p>
              )}

              <button type="submit" disabled={loading || !code.trim()} className="gradient-button mt-6 w-full">
                {loading ? "Entrando..." : "Entrar no evento"}
                {!loading && <ArrowRightIcon className="size-5" />}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/8 pt-5 text-xs text-slate-500">
              <ShieldIcon className="size-4 text-violet-300" />
              Sua sessão fica protegida pelo Supabase
            </div>
          </section>
        </section>
      </div>
    </AppShell>
  );
}
