import Image from "next/image";
import Link from "next/link";
import { events } from "@/data/events";
import {
  AppShell,
  ArrowRightIcon,
  CameraIcon,
  GtiLogo,
  ImageIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/gti-ui";

export default function Home() {
  const event = events[0];

  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-5 py-5 sm:px-8 sm:py-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <span className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#4ade80]" />
            Memórias do evento, em segurança
          </span>
        </header>

        <section className="grid flex-1 items-center gap-14 py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Álbum colaborativo da galera
            </span>

            <h1 className="mt-6 text-[3.35rem] leading-[0.92] font-black tracking-[-0.065em] text-white sm:text-7xl lg:text-[5.6rem]">
              A galera registra.
              <span className="text-gradient block">O GTI guarda.</span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Seus melhores clicks, reunidos em um álbum privado feito para viver e reviver cada momento do evento.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/evento/entrar" className="gradient-button w-full sm:w-auto">
                Entrar no evento
                <ArrowRightIcon className="size-5" />
              </Link>
              <span className="flex items-center justify-center gap-2 px-3 text-xs text-slate-500 sm:justify-start">
                <ShieldIcon className="size-4 text-violet-300" />
                Acesso privado por evento
              </span>
            </div>

            <div className="mt-11 grid max-w-lg grid-cols-3 gap-3 border-t border-white/8 pt-6">
              <HomeFeature icon={<CameraIcon className="size-4" />} label="Registre" />
              <HomeFeature icon={<ImageIcon className="size-4" />} label="Compartilhe" />
              <HomeFeature icon={<SparklesIcon className="size-4" />} label="Reviva" />
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[34rem] lg:mx-0 lg:ml-auto">
            <div className="absolute -inset-10 -z-10 rounded-full bg-violet-600/15 blur-3xl" aria-hidden="true" />
            <div className="glass-panel relative overflow-hidden rounded-[2.25rem] p-3 sm:p-4">
              <div className="absolute -top-3 left-8 rounded-full border border-fuchsia-300/20 bg-[#120a24] px-3 py-1 text-[0.62rem] font-black tracking-[0.14em] text-fuchsia-200 uppercase shadow-lg">
                Experiência ao vivo
              </div>
              <Image
                src="/assets/gti-click/banner.jpg"
                alt="GTI CLICK — A galera registra. O GTI guarda."
                width={1536}
                height={614}
                priority
                sizes="(max-width: 1024px) 100vw, 34rem"
                className="mt-1 w-full rounded-[1.4rem] object-contain"
              />
              <div className="relative mt-3 min-h-[20rem] overflow-hidden rounded-[1.4rem] border border-violet-300/10 bg-[radial-gradient(circle_at_25%_30%,rgba(217,70,239,.18),transparent_35%),linear-gradient(145deg,#120b22,#080711)] sm:min-h-[23rem]">
                <Image
                  src="/assets/gti-click/mascot-phone-seated.jpg"
                  alt="Mascote GTI CLICK segurando um celular"
                  fill
                  priority
                  sizes="(max-width: 1024px) 62vw, 21rem"
                  className="object-contain object-left-bottom mix-blend-screen"
                />
                <div className="absolute right-3 bottom-3 w-[48%] rounded-2xl border border-white/10 bg-[#0a0814]/88 p-4 shadow-2xl backdrop-blur sm:right-5 sm:bottom-5">
                  <p className="text-[0.62rem] font-black tracking-[0.12em] text-fuchsia-200 uppercase">Próximo evento</p>
                  <p className="mt-2 text-sm font-black leading-tight text-white sm:text-base">{event.nome}</p>
                  <p className="mt-3 text-[0.65rem] leading-relaxed text-slate-400">{event.data}<br />{event.local}</p>
                  <Link href="/evento/entrar" className="mt-4 inline-flex items-center gap-1.5 text-[0.7rem] font-black text-violet-300">
                    Entrar <ArrowRightIcon className="size-3.5" />
                  </Link>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-white">Memórias da galera</p>
                  <p className="mt-1 text-[0.65rem] text-slate-500">Fotos aprovadas pela equipe GTI</p>
                </div>
                <span className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-200">
                  <ImageIcon className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/8 py-5 text-xs text-slate-500">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <p>© GTI CLICK · Feito para a comunidade Galera do TI</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a className="transition hover:text-white" href="https://galeradoti.com">GALERADOTI.com</a>
              <a className="transition hover:text-white" href="https://instagram.com/galera.do.ti">@galera.do.ti</a>
              <a className="transition hover:text-white" href="mailto:administracao@galeradoti.com">Contato</a>
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}

function HomeFeature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
      <span className="grid size-7 place-items-center rounded-lg bg-violet-400/10 text-violet-200">{icon}</span>
      {label}
    </div>
  );
}
