import { ApertureIcon, AppShell, ArrowLeftIcon } from "@/components/gti-ui";

export default function GalleryLoading() {
  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-7xl px-2.5 pb-28 pt-4 sm:px-6 lg:px-8" aria-busy="true" aria-label="Carregando galeria">
        <header className="flex items-center justify-between px-1.5 pb-4 sm:px-0">
          <span className="icon-button rounded-full"><ArrowLeftIcon className="size-5" /></span>
          <div className="text-center"><div className="flex items-center gap-1.5"><p className="text-base font-black text-white">AWS Summit SP</p><ApertureIcon className="size-3.5 text-violet-400" /></div><p className="mt-0.5 text-[0.62rem] text-slate-600">organizando os clicks...</p></div>
          <span className="skeleton size-11 rounded-full" />
        </header>
        <div className="mb-3 border-y border-white/6 py-2.5"><div className="skeleton h-7 w-16 rounded-full" /></div>
        <div className="gallery-grid">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="gallery-card">
              <div className="skeleton aspect-[4/5]" />
              <div className="gallery-card-body">
                <div className="flex gap-1.5"><span className="skeleton h-10 flex-1 rounded-lg" /><span className="skeleton h-10 flex-1 rounded-lg" /></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
