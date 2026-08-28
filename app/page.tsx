import Link from "next/link";

export default function Home() {
  return (
    <main className="home-shell relative flex min-h-svh flex-col overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
      <div className="lens" aria-hidden="true" />

      <header className="relative z-10 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-violet-600 shadow-[0_10px_30px_rgba(124,58,237,0.28)]">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5 fill-none stroke-white"
            strokeWidth="1.8"
          >
            <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.1-1.5h6.4L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8Z" />
            <circle cx="12" cy="12.5" r="3.5" />
          </svg>
        </span>
        <span className="text-sm font-bold tracking-[0.18em] text-white">
          GTI CLICK
        </span>
      </header>

      <section className="relative z-10 flex flex-1 items-center py-16 sm:py-20">
        <div className="mx-auto w-full max-w-5xl">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-semibold tracking-[0.16em] text-violet-300 uppercase">
              A galera registra. O GTI guarda.
            </p>

            <h1 className="text-6xl leading-[0.88] font-black tracking-[-0.07em] text-white sm:text-7xl md:text-8xl lg:text-9xl">
              GTI <span className="text-violet-500">CLICK</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-relaxed text-slate-300 sm:text-xl">
              Os melhores momentos da galera, em um só lugar.
            </p>

            <Link
              href="/evento/entrar"
              className="mt-9 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-violet-600 px-7 text-base font-bold text-white shadow-[0_16px_45px_rgba(124,58,237,0.25)] transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:w-auto"
            >
              Entrar no evento
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 pt-5 text-sm text-slate-400">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-7">
          <a className="transition hover:text-white" href="https://galeradoti.com">
            GALERADOTI.com
          </a>
          <a
            className="transition hover:text-white"
            href="https://instagram.com/galera.do.ti"
          >
            @galera.do.ti
          </a>
          <a
            className="break-all transition hover:text-white"
            href="mailto:administracao@galeradoti.com"
          >
            administracao@galeradoti.com
          </a>
        </div>
      </footer>
    </main>
  );
}
