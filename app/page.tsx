import Image from "next/image";
import Link from "next/link";
import {
  AppShell,
  ArrowRightIcon,
  CameraIcon,
  GtiLogo,
  ShieldIcon,
} from "@/components/gti-ui";

export default function Home() {
  return (
    <AppShell className="welcome-app">
      <div className="welcome-screen mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-6 pt-4 sm:px-6">
        <header className="flex items-center justify-between">
          <GtiLogo size="compact" />
          <span className="welcome-private"><ShieldIcon className="size-3.5" />álbum privado</span>
        </header>

        <main className="flex flex-1 flex-col">
          <section className="welcome-copy fade-up pt-3 text-center">
            <p className="welcome-kicker">GTI CLICK</p>
            <h1 className="mt-2 text-[2.55rem] leading-[0.92] font-black tracking-[-0.065em] text-white min-[390px]:text-[2.85rem]">
              A galera registra.<br />
              O <span className="text-gradient">GTI</span> guarda.
            </h1>
          </section>

          <section className="welcome-visual" aria-label="A galera registrando memórias">
            <div className="welcome-visual-halo" aria-hidden="true" />
            <div className="welcome-art-frame" aria-hidden="true">
              <span className="welcome-orbit welcome-orbit-one"><CameraIcon className="size-4" /></span>
              <span className="welcome-orbit welcome-orbit-two">✦</span>
            </div>
            <div className="welcome-mascot mascot-float">
              <Image
                src="/assets/gti-click/mascot-phone.jpg"
                alt="Mascote oficial GTI CLICK registrando o evento"
                fill
                priority
                sizes="18rem"
                className="object-contain object-center mix-blend-screen"
              />
            </div>
          </section>

          <section className="welcome-actions mt-auto text-center">
            <p className="mx-auto max-w-[17rem] text-sm leading-relaxed text-slate-300">
              Os melhores momentos da galera, em um só lugar.
            </p>
            <Link href="/evento/entrar" className="gradient-button mt-5 w-full text-base">
              Entrar no evento
              <ArrowRightIcon className="size-5" />
            </Link>
          </section>
        </main>

        <footer className="mt-5 text-center text-[0.6rem] font-semibold tracking-[0.12em] text-slate-700 uppercase">
          Galera do TI · São Paulo
        </footer>
      </div>
    </AppShell>
  );
}
