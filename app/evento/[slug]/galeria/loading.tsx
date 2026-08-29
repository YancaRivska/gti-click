import { AppShell, GtiLogo, ShieldIcon } from "@/components/gti-ui";

export default function GalleryLoading() {
  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-7xl px-4 py-5 sm:px-8 sm:py-7 lg:px-10" aria-busy="true">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <span className="flex items-center gap-2 text-[0.65rem] font-bold text-slate-500 sm:text-xs">
            <ShieldIcon className="size-4 text-violet-300" />
            Galeria privada
          </span>
        </header>
        <section className="py-8 sm:py-11">
          <div className="skeleton h-4 w-44 rounded" />
          <div className="skeleton mt-7 h-14 w-80 max-w-full rounded-xl" />
          <div className="skeleton mt-4 h-4 w-96 max-w-full rounded" />
          <p className="mt-5 text-xs font-semibold text-violet-300">Organizando os clicks...</p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-white/5">
                <div className={`skeleton ${index % 5 === 0 ? "aspect-[4/5]" : "aspect-square"}`} />
                <div className="bg-[#0a0814] p-3">
                  <div className="skeleton h-3 w-2/3 rounded" />
                  <div className="skeleton mt-3 h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
