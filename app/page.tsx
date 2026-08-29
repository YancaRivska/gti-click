import Image from "next/image";
import Link from "next/link";
import {
  AppShell,
  ArrowRightIcon,
  GtiLogo,
} from "@/components/gti-ui";

export default function Home() {
  return (
    <AppShell className="welcome-app">
      <div className="welcome-screen mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-6 pt-7 sm:px-6">
        <main className="flex flex-1 flex-col text-center">
          <section className="fade-up">
            <GtiLogo size="hero" />
            <p className="mx-auto mt-1 max-w-56 text-lg leading-snug font-medium text-white">
              A galera registra.<br />O <span className="font-black text-violet-400">GTI</span> guarda.
            </p>
          </section>

          <section className="welcome-visual" aria-label="Mascote oficial GTI CLICK registrando o evento">
            <div className="welcome-visual-halo" aria-hidden="true" />
            <div className="welcome-art-frame" aria-hidden="true" />
            <div className="welcome-mascot mascot-float">
              <Image
                src="/assets/gti-click/mascot-phone.jpg"
                alt="Mascote oficial GTI CLICK registrando uma memória"
                fill
                priority
                sizes="17rem"
                className="object-contain object-center mix-blend-screen"
              />
            </div>
          </section>

          <section className="welcome-actions mt-auto">
            <p className="mx-auto max-w-[17rem] text-sm leading-relaxed text-white/80">
              Os melhores momentos da galera, em um só lugar.
            </p>
            <Link href="/evento/entrar" className="gradient-button mt-5 w-full text-base">
              Entrar no evento
              <ArrowRightIcon className="size-5" />
            </Link>
          </section>
        </main>

        <footer className="mt-6 text-center text-[0.58rem] font-semibold tracking-[0.12em] text-slate-700 uppercase">
          Galera do TI
        </footer>
      </div>
    </AppShell>
  );
}
