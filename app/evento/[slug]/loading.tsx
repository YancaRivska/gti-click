import { ApertureIcon, AppShell, GtiLogo } from "@/components/gti-ui";

export default function EventLoading() {
  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-6xl px-5 py-5 sm:px-8 sm:py-7" aria-busy="true" aria-live="polite">
        <header className="border-b border-white/8 pb-5"><GtiLogo /></header>
        <section className="flex min-h-[70svh] flex-col items-center justify-center text-center">
          <span className="grid size-16 place-items-center rounded-full border border-violet-300/15 bg-violet-500/8 text-violet-300">
            <ApertureIcon className="size-8 animate-pulse" />
          </span>
          <p className="mt-4 font-bold text-violet-200">Preparando as memórias da galera...</p>
          <div className="mt-5 h-1.5 w-44 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />
          </div>
        </section>
      </div>
    </AppShell>
  );
}
