import Image from "next/image";
import Link from "next/link";
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
  return (
    <AppShell className="home-app">
      <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-5 pb-5 pt-4 sm:px-8 sm:pt-6 lg:px-10">
        <header className="flex items-center justify-between">
          <GtiLogo size="default" />
          <span className="live-pill">
            <span className="live-pill-dot" />
            Memórias ao vivo
          </span>
        </header>

        <main className="home-hero flex flex-1 flex-col lg:grid lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:gap-14">
          <section className="fade-up z-10 pt-5 text-center sm:pt-8 lg:pt-0 lg:text-left">
            <span className="eyebrow">
              <SparklesIcon className="size-3.5" />
              O álbum oficial da galera
            </span>
            <h1 className="mx-auto mt-5 max-w-lg text-[3.15rem] leading-[0.88] font-black tracking-[-0.072em] text-white sm:text-6xl lg:mx-0 lg:text-[4.7rem]">
              A galera
              <span className="block text-gradient">registra.</span>
              O GTI guarda.
            </h1>
            <p className="mx-auto mt-5 max-w-sm text-[0.94rem] leading-relaxed text-slate-400 sm:text-base lg:mx-0">
              Os melhores momentos da galera, em um só lugar — bonitos, privados e fáceis de reviver.
            </p>

            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link href="/evento/entrar" className="gradient-button w-full max-w-sm text-base sm:w-auto sm:min-w-60">
                Entrar no evento
                <ArrowRightIcon className="size-5" />
              </Link>
              <span className="flex min-h-12 items-center gap-2 px-3 text-xs font-bold text-slate-500">
                <ShieldIcon className="size-4 text-violet-300" />
                Álbum privado
              </span>
            </div>
          </section>

          <section className="home-scene fade-up relative mx-auto mt-3 h-[24rem] w-full max-w-lg sm:h-[30rem] lg:mt-0 lg:h-[39rem] lg:max-w-xl" aria-label="Experiência GTI CLICK">
            <div className="home-scene-card">
              <Image
                src="/assets/gti-click/banner.jpg"
                alt="Evento GTI CLICK com a galera registrando fotos"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 36rem"
                className="object-cover"
              />
              <div className="home-scene-shade" />
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
                <span className="scene-label">AWS SUMMIT · SP</span>
                <span className="scene-count"><ImageIcon className="size-3.5" />álbum da equipe</span>
              </div>
            </div>

            <div className="home-mascot">
              <Image
                src="/assets/gti-click/mascot-phone.jpg"
                alt="Mascote oficial GTI CLICK fotografando o evento"
                fill
                priority
                sizes="(max-width: 1024px) 18rem, 28rem"
                className="object-contain object-bottom mix-blend-screen"
              />
            </div>

            <div className="scene-memory-card">
              <span className="grid size-9 place-items-center rounded-xl bg-violet-500/15 text-violet-100">
                <CameraIcon className="size-4.5" />
              </span>
              <div>
                <p className="text-xs font-black text-white">Click publicado</p>
                <p className="mt-0.5 text-[0.62rem] text-slate-500">Já apareceu na galeria 💜</p>
              </div>
            </div>

            <span className="scene-spark scene-spark-one" aria-hidden="true">✦</span>
            <span className="scene-spark scene-spark-two" aria-hidden="true">✦</span>
          </section>
        </main>

        <footer className="flex items-center justify-between border-t border-white/6 pt-4 text-[0.63rem] text-slate-600">
          <span>GTI CLICK · Galera do TI</span>
          <a href="https://instagram.com/galera.do.ti" className="transition hover:text-white">@galera.do.ti</a>
        </footer>
      </div>
    </AppShell>
  );
}
