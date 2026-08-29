import Image from "next/image";
import Link from "next/link";
import {
  AppShell,
  ArrowRightIcon,
  CameraIcon,
  GtiLogo,
  ImageIcon,
  ShieldIcon,
} from "@/components/gti-ui";

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 pb-6 pt-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.12em] text-slate-500 uppercase">
            <span className="size-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_12px_#d946ef]" />
            Galera do TI
          </span>
          <span className="grid size-10 place-items-center rounded-full border border-white/8 bg-white/[0.035] text-violet-200">
            <CameraIcon className="size-4.5" />
          </span>
        </header>

        <section className="grid flex-1 items-center gap-6 py-7 lg:grid-cols-[.86fr_1.14fr] lg:gap-16 lg:py-10">
          <div className="fade-up mx-auto flex w-full max-w-md flex-col items-center text-center lg:items-start lg:text-left">
            <GtiLogo size="hero" />
            <h1 className="mt-1 text-[2.6rem] leading-[0.94] font-black tracking-[-0.06em] text-white sm:text-6xl">
              A galera registra.
              <span className="block">O <span className="text-gradient">GTI</span> guarda.</span>
            </h1>
            <div className="hidden lg:block">
              <p className="mt-5 max-w-sm text-base leading-relaxed text-slate-400">Os melhores momentos da galera, em um só lugar.</p>
              <Link href="/evento/entrar" className="gradient-button mt-7 w-full max-w-sm text-base">Entrar no evento<ArrowRightIcon className="size-5" /></Link>
              <div className="mt-5 flex items-center gap-5 text-[0.68rem] font-semibold text-slate-600">
                <span className="flex items-center gap-1.5"><ShieldIcon className="size-3.5 text-violet-400" />Privado</span>
                <span className="flex items-center gap-1.5"><ImageIcon className="size-3.5 text-fuchsia-400" />Colaborativo</span>
                <span className="flex items-center gap-1.5"><CameraIcon className="size-3.5 text-blue-400" />Ao vivo</span>
              </div>
            </div>
          </div>

          <div className="brand-stage relative mx-auto h-[21rem] w-full max-w-md sm:h-[29rem] lg:h-[38rem] lg:max-w-xl">
            <div className="absolute top-[12%] left-[3%] z-20 rounded-full border border-fuchsia-300/15 bg-fuchsia-500/8 px-3 py-1.5 text-[0.62rem] font-black tracking-[0.12em] text-fuchsia-200 uppercase backdrop-blur">
              Click. Compartilhe. Reviva.
            </div>
            <Image
              src="/assets/gti-click/mascot-phone.jpg"
              alt="Mascote oficial GTI CLICK registrando uma memória"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 34rem"
              className="float-soft object-contain object-center mix-blend-screen drop-shadow-[0_0_38px_rgba(217,70,239,.18)]"
            />
            <div className="absolute right-[2%] bottom-[9%] z-20 max-w-40 rounded-2xl border border-white/10 bg-[#090711]/88 p-3 shadow-2xl backdrop-blur-xl sm:right-[6%] sm:max-w-44 sm:p-4">
              <span className="grid size-8 place-items-center rounded-xl bg-violet-500/15 text-violet-200"><CameraIcon className="size-4" /></span>
              <p className="mt-2 text-xs font-black text-white sm:text-sm">Essa memória é da galera 💜</p>
              <p className="mt-1 text-[0.6rem] leading-relaxed text-slate-500">Registre os momentos do evento em um álbum privado.</p>
            </div>
          </div>

          <div className="-mt-5 flex flex-col items-center text-center lg:hidden">
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">Os melhores momentos da galera, em um só lugar.</p>
            <Link href="/evento/entrar" className="gradient-button mt-5 w-full max-w-sm text-base">Entrar no evento<ArrowRightIcon className="size-5" /></Link>
            <div className="mt-4 flex items-center gap-5 text-[0.65rem] font-semibold text-slate-600">
              <span className="flex items-center gap-1.5"><ShieldIcon className="size-3.5 text-violet-400" />Privado</span>
              <span className="flex items-center gap-1.5"><ImageIcon className="size-3.5 text-fuchsia-400" />Colaborativo</span>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/7 pt-5 text-[0.65rem] text-slate-600 lg:justify-between">
          <span>GTI CLICK · Galera do TI</span>
          <div className="flex gap-4">
            <a href="https://galeradoti.com" className="transition hover:text-white">GALERADOTI.com</a>
            <a href="https://instagram.com/galera.do.ti" className="transition hover:text-white">@galera.do.ti</a>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
