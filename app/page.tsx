import Image from "next/image";
import Link from "next/link";
import {
  ApertureIcon,
  AppShell,
  ArrowRightIcon,
  CameraIcon,
  GlobeIcon,
  GtiLogo,
  ImageIcon,
  InstagramIcon,
  MessageIcon,
  SparklesIcon,
  UsersIcon,
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

          <Link href="/meu-gti" className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 text-xs font-bold text-violet-300 transition hover:text-white">
            <UsersIcon className="size-4" />Minha jornada GTI
          </Link>
        </main>

        <footer className="home-identity-footer">
          <div className="home-mascot-duo" aria-hidden="true">
            <div className="home-mascot-figure home-mascot-figure-tech">
              <Image
                src="/assets/gti-click/mascot-tech.png"
                alt=""
                fill
                priority
                sizes="(max-width: 430px) 34vw, 8rem"
                className="object-contain object-bottom"
              />
            </div>
            <div className="home-mascot-figure home-mascot-figure-photographer">
              <Image
                src="/assets/gti-click/mascot-photographer.png"
                alt=""
                fill
                priority
                sizes="(max-width: 430px) 34vw, 8rem"
                className="object-contain object-bottom"
              />
            </div>
          </div>

          <nav className="home-contact-links" aria-label="Canais da Galera do TI">
            <a
              href="https://www.instagram.com/galera.do.ti/"
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir o Instagram da Galera do TI"
            >
              <InstagramIcon />
              <span>@galera.do.ti</span>
            </a>
            <a
              href="https://galeradoti.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Abrir o site galeradoti.com"
            >
              <GlobeIcon />
              <span>galeradoti.com</span>
            </a>
            <a
              href="https://wa.me/5519991918817"
              target="_blank"
              rel="noreferrer"
              aria-label="Entrar em contato pelo WhatsApp"
            >
              <MessageIcon />
              <span>Contato</span>
            </a>
          </nav>
        </footer>
      </div>
    </AppShell>
  );
}
