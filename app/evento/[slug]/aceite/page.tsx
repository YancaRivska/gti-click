import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AppShell,
  BackLink,
  CameraIcon,
  CheckIcon,
  GtiLogo,
  ShieldIcon,
  SparklesIcon,
} from "@/components/gti-ui";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createClient } from "@/lib/supabase/server";
import { acceptConsent } from "./actions";

export default async function ConsentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    redirect("/evento/entrar");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/evento/entrar");
  }

  if (await hasEventConsent(supabase, user.id, event.id)) {
    redirect(`/evento/${event.slug}`);
  }

  const error = (await searchParams).error;

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-6xl px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <ShieldIcon className="size-4 text-violet-300" />
            Consentimento protegido
          </span>
        </header>

        <div className="py-8 sm:py-12">
          <BackLink href="/evento/entrar">Voltar</BackLink>

          <section className="mt-6 grid overflow-hidden rounded-[2rem] border border-white/9 bg-[#0a0814]/90 shadow-[0_32px_90px_rgba(0,0,0,.38)] lg:grid-cols-[.82fr_1.18fr]">
            <div className="relative overflow-hidden border-b border-white/8 bg-[radial-gradient(circle_at_25%_15%,rgba(217,70,239,.24),transparent_35%),linear-gradient(145deg,#24103f,#100a21_65%,#0b0915)] p-6 sm:p-9 lg:border-r lg:border-b-0">
              <div className="absolute -right-20 -bottom-24 size-72 rounded-full border border-violet-300/12 shadow-[inset_0_0_0_32px_rgba(139,92,246,.035),inset_0_0_0_64px_rgba(139,92,246,.035)]" aria-hidden="true" />
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Passo importante
              </span>
              <h1 className="mt-6 text-4xl leading-[0.95] font-black tracking-[-0.05em] text-white sm:text-5xl">
                Antes do
                <span className="text-gradient block">click 👀</span>
              </h1>
              <p className="mt-5 text-sm leading-relaxed text-slate-400">
                Tudo transparente para a galera curtir o álbum com segurança e respeito.
              </p>

              <div className="relative mt-5 h-40 overflow-hidden rounded-2xl border border-violet-300/10 bg-black/10 lg:h-48">
                <Image src="/assets/gti-click/mascot-phone-seated.jpg" alt="Mascote GTI CLICK com celular" fill sizes="(max-width: 1024px) 12rem, 15rem" className="object-contain object-center mix-blend-screen" />
              </div>

              <div className="mt-6 space-y-3">
                <TrustItem icon={<ShieldIcon className="size-4" />} text="Álbum acessível apenas por participantes autorizados" />
                <TrustItem icon={<CameraIcon className="size-4" />} text="Seu @ pode ser informado em cada foto publicada" />
                <TrustItem icon={<SparklesIcon className="size-4" />} text="Você pode revogar o consentimento depois" />
              </div>
            </div>

            <div className="p-6 sm:p-9 lg:p-11">
              <p className="text-xs font-black tracking-[0.14em] text-violet-300 uppercase">{event.nome}</p>
              <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">Participação e uso de imagem</h2>

              <div className="mt-7 space-y-4 text-sm leading-relaxed text-slate-300 sm:text-base">
                <div className="soft-panel rounded-2xl p-4 sm:p-5">
                  <span className="mb-3 grid size-8 place-items-center rounded-xl bg-violet-400/10 text-xs font-black text-violet-200">01</span>
                  <p>As fotos enviadas neste evento serão compartilhadas no álbum colaborativo e poderão ser visualizadas e baixadas pelos participantes autorizados.</p>
                </div>
                <div className="soft-panel rounded-2xl p-4 sm:p-5">
                  <span className="mb-3 grid size-8 place-items-center rounded-xl bg-fuchsia-400/10 text-xs font-black text-fuchsia-200">02</span>
                  <p>Autorizo a Galera do TI a utilizar as imagens que eu enviar ao GTI CLICK para produção e divulgação de conteúdos relacionados à comunidade, eventos e redes sociais, conforme os termos apresentados.</p>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-400"><ShieldIcon className="size-4 shrink-0 text-violet-300" />Respeite as pessoas, o ambiente e as regras do evento.</p>

              <form action={acceptConsent} className="mt-7">
                <input type="hidden" name="eventSlug" value={event.slug} />
                <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-300/20 bg-violet-400/[0.07] p-4 text-sm leading-relaxed text-slate-200 transition hover:border-violet-300/35 hover:bg-violet-400/10">
                  <input type="checkbox" name="consent" required className="peer sr-only" />
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-white/20 bg-black/20 text-transparent transition peer-checked:border-violet-400 peer-checked:bg-violet-500 peer-checked:text-white">
                    <CheckIcon className="size-3.5" />
                  </span>
                  <span>Li e concordo com os termos de participação e uso de imagem.</span>
                </label>

                {error === "required" && (
                  <p role="alert" className="mt-3 rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-sm text-red-200">Você precisa aceitar os termos para continuar.</p>
                )}
                {error === "save" && (
                  <p role="alert" className="mt-3 rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-2.5 text-sm text-red-200">Não foi possível registrar o aceite. Tente novamente.</p>
                )}

                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-violet-300">
                  <Link className="underline decoration-violet-400/30 underline-offset-4 transition hover:text-white" href="/termos" target="_blank" rel="noreferrer">Termos de Uso</Link>
                  <Link className="underline decoration-violet-400/30 underline-offset-4 transition hover:text-white" href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</Link>
                </div>

                <button type="submit" className="gradient-button mt-7 w-full">
                  <CheckIcon className="size-5" />
                  Entrar no álbum
                </button>
                <p className="mt-4 text-center text-xs leading-relaxed text-slate-600">Seu aceite fica associado à sua sessão e à versão atual dos termos.</p>
              </form>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-xs leading-relaxed text-slate-300">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-violet-200">{icon}</span>
      {text}
    </div>
  );
}
