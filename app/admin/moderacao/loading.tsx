import { AppShell, GtiLogo, ShieldIcon } from "@/components/gti-ui";

export default function ModerationLoading() {
  return (
    <AppShell>
      <div
        className="mx-auto min-h-svh w-full max-w-7xl px-5 py-5 sm:px-8 sm:py-7 lg:px-10"
        aria-busy="true"
        aria-label="Carregando moderação"
      >
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <span className="hidden items-center gap-2 text-xs font-bold text-slate-500 sm:flex">
            <ShieldIcon className="size-4 text-violet-300" />
            Área restrita
          </span>
        </header>
        <section className="py-8 sm:py-11">
          <div className="skeleton h-4 w-36 rounded" />
          <div className="skeleton mt-7 h-14 w-72 max-w-full rounded-xl" />
          <p className="mt-5 text-xs font-semibold text-violet-300">
            Preparando a curadoria...
          </p>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-white/5">
                <div className="skeleton aspect-square" />
                <div className="bg-[#0a0814] p-4">
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="skeleton mt-4 h-12 w-full rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
