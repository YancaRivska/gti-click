import Link from "next/link";
import {
  ApertureIcon,
  AppShell,
  ArrowRightIcon,
  CameraIcon,
  GtiLogo,
  ImageIcon,
  SparklesIcon,
} from "@/components/gti-ui";

export default function Home() {
  return (
    <AppShell className="welcome-app">
      <div className="reference-welcome mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pb-7 pt-8">
        <main className="flex flex-1 flex-col justify-center text-center">
          <section className="fade-up">
            <GtiLogo size="hero" />
            <p className="mx-auto mt-4 max-w-56 text-[1.05rem] leading-snug text-white">
              A galera registra.<br />O <span className="font-bold text-violet-400">GTI</span> guarda.
            </p>
          </section>

          <div className="reference-icon-cloud" aria-hidden="true">
            <CameraIcon className="reference-icon reference-icon-one" />
            <ImageIcon className="reference-icon reference-icon-two" />
            <ApertureIcon className="reference-icon reference-icon-three" />
            <SparklesIcon className="reference-icon reference-icon-four" />
          </div>

          <p className="mx-auto max-w-[15rem] text-sm leading-relaxed text-white/80">
            Os melhores momentos da <span className="text-violet-400">galera</span>, em um só lugar.
          </p>

          <Link href="/evento/entrar" className="gradient-button mt-6 w-full text-sm">
            Entrar no evento
            <ArrowRightIcon className="size-4.5" />
          </Link>

          <div className="reference-divider"><span>ou</span></div>

          <Link href="/evento/entrar" className="reference-code-link">
            <span>Digite o código do evento</span>
            <span className="reference-scan-icon"><ApertureIcon className="size-4" /></span>
          </Link>
        </main>
      </div>
    </AppShell>
  );
}
