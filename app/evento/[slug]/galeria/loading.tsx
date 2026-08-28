export default function GalleryLoading() {
  return (
    <main className="home-shell min-h-svh px-5 py-10" aria-busy="true">
      <section className="mx-auto w-full max-w-6xl">
        <div className="h-4 w-44 animate-pulse rounded bg-white/10" />
        <div className="mt-5 h-12 w-72 max-w-full animate-pulse rounded-xl bg-white/10" />
        <p className="mt-4 text-sm text-slate-400">Carregando os clicks...</p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="aspect-square animate-pulse rounded-2xl border border-white/5 bg-white/5"
            />
          ))}
        </div>
      </section>
    </main>
  );
}
