import Image from "next/image";
import Link from "next/link";
import {
  AppShell,
  BackLink,
  CameraIcon,
  DownloadIcon,
  EmptyState,
  GtiLogo,
  ImageIcon,
  MobileEventNav,
  ShieldIcon,
} from "@/components/gti-ui";
import { requireEventAccess } from "@/lib/event-access";

const BUCKET = "event-photos";
const SIGNED_URL_DURATION = 60 * 10;
const DOWNLOAD_URL_DURATION = 60 * 5;

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ deleted?: string | string[] }>;
}) {
  const { slug } = await params;
  const { event, supabase } = await requireEventAccess(slug);
  const query = await searchParams;

  const { data: photos, error: photosError } = await supabase
    .from("photo_uploads")
    .select("id, storage_path, caption, instagram_handle, created_at")
    .eq("event_id", event.id)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false });

  if (photosError) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug}>
        <EmptyState icon={<ImageIcon className="size-6" />} visual={<Image src="/assets/gti-click/error-camera.jpg" alt="Câmera com alerta" fill sizes="8rem" className="object-contain mix-blend-screen" />} title="Não conseguimos carregar a galeria" description="Tente novamente em alguns instantes. Seus clicks continuam protegidos.">
          <Link href={`/evento/${event.slug}`} className="secondary-button mt-6">Voltar ao evento</Link>
        </EmptyState>
      </GalleryShell>
    );
  }

  if (!photos.length) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug} photoCount={0}>
        <EmptyState icon={<CameraIcon className="size-6" />} visual={<Image src="/assets/gti-click/mascot-camera.jpg" alt="Mascote GTI CLICK com câmera" fill sizes="8rem" className="object-contain mix-blend-screen" />} title="Nenhuma foto aprovada ainda" description="Que tal publicar um click e começar o álbum da galera?">
          <Link href={`/evento/${event.slug}/enviar`} className="gradient-button mt-6">Enviar uma foto</Link>
        </EmptyState>
      </GalleryShell>
    );
  }

  const paths = photos.map((photo) => photo.storage_path);
  const [signedResult, downloadResult] = await Promise.all([
    supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_DURATION),
    supabase.storage.from(BUCKET).createSignedUrls(paths, DOWNLOAD_URL_DURATION, { download: true }),
  ]);

  if (signedResult.error || downloadResult.error) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug}>
        <EmptyState icon={<ShieldIcon className="size-6" />} visual={<Image src="/assets/gti-click/error-camera.jpg" alt="Câmera com alerta" fill sizes="8rem" className="object-contain mix-blend-screen" />} title="Não conseguimos carregar a galeria" description="Os links privados não ficaram disponíveis agora. Tente atualizar a página daqui a pouco.">
          <Link href={`/evento/${event.slug}`} className="secondary-button mt-6">Voltar ao evento</Link>
        </EmptyState>
      </GalleryShell>
    );
  }

  const signedUrls = new Map(signedResult.data.map((photo) => [photo.path, photo.signedUrl]));
  const downloadUrls = new Map(downloadResult.data.map((photo) => [photo.path, photo.signedUrl]));
  const visiblePhotos = photos.flatMap((photo) => {
    const signedUrl = signedUrls.get(photo.storage_path);
    const downloadUrl = downloadUrls.get(photo.storage_path);
    return signedUrl && downloadUrl ? [{ ...photo, signedUrl, downloadUrl }] : [];
  });

  if (!visiblePhotos.length) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug}>
        <EmptyState icon={<ImageIcon className="size-6" />} visual={<Image src="/assets/gti-click/error-camera.jpg" alt="Câmera com alerta" fill sizes="8rem" className="object-contain mix-blend-screen" />} title="Fotos indisponíveis agora" description="Tente novamente em alguns instantes. O acesso ao bucket permanece privado." />
      </GalleryShell>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <GalleryShell eventName={event.nome} eventSlug={event.slug} photoCount={visiblePhotos.length}>
      {query.deleted === "1" && (
        <p role="status" className="mt-6 rounded-xl border border-emerald-300/15 bg-emerald-400/[0.07] px-4 py-3 text-sm text-emerald-100">
          Foto excluída com sucesso.
        </p>
      )}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {visiblePhotos.map((photo, index) => (
          <article key={photo.id} className="photo-card group">
            <Link href={`/evento/${event.slug}/galeria/${photo.id}`} className="relative block overflow-hidden bg-[#0b0915]">
              <Image
                src={photo.signedUrl}
                alt={photo.caption || "Foto do evento"}
                width={900}
                height={900}
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`${index % 5 === 0 ? "aspect-[4/5]" : "aspect-square"} w-full object-cover transition duration-300 group-hover:scale-[1.025]`}
              />
              <span className="absolute right-3 bottom-3 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[0.62rem] font-bold text-white/85 opacity-0 backdrop-blur transition group-hover:opacity-100">
                Ver foto
              </span>
            </Link>
            <div className="p-3 sm:p-4">
              {photo.instagram_handle && <p className="truncate text-xs font-black text-violet-300 sm:text-sm">{photo.instagram_handle}</p>}
              {photo.caption && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-300 sm:text-sm">{photo.caption}</p>}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/7 pt-3">
                <time dateTime={photo.created_at} className="truncate text-[0.62rem] text-slate-600 sm:text-xs">
                  {dateFormatter.format(new Date(photo.created_at))}
                </time>
                <a href={photo.downloadUrl} download aria-label="Baixar foto" className="grid size-8 shrink-0 place-items-center rounded-lg border border-violet-300/15 bg-violet-400/[0.07] text-violet-200 transition hover:bg-violet-400/15">
                  <DownloadIcon className="size-4" />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </GalleryShell>
  );
}

function GalleryShell({
  children,
  eventName,
  eventSlug,
  photoCount,
}: {
  children: React.ReactNode;
  eventName: string;
  eventSlug: string;
  photoCount?: number;
}) {
  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-7xl px-4 py-5 pb-28 sm:px-8 sm:py-7 lg:px-10 lg:pb-0">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <span className="flex items-center gap-2 text-[0.65rem] font-bold text-slate-500 sm:text-xs">
            <ShieldIcon className="size-4 text-violet-300" />
            Galeria privada
          </span>
        </header>

        <section className="py-8 sm:py-11">
          <BackLink href={`/evento/${eventSlug}`}>{eventName}</BackLink>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />Memórias aprovadas</span>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">Galeria da <span className="text-gradient">galera</span></h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">Os clicks mais recentes aparecem primeiro. Toque em uma foto para ver os detalhes.</p>
            </div>
            <Link href={`/evento/${eventSlug}/enviar`} className="gradient-button hidden w-full sm:inline-flex sm:w-auto">
              <CameraIcon className="size-5" />
              Enviar foto
            </Link>
          </div>

          <div className="mt-7 flex items-center gap-2 border-b border-white/8 pb-4">
            <span className="rounded-full border border-violet-300/25 bg-violet-400/10 px-4 py-2 text-xs font-black text-violet-100">Todos</span>
            {typeof photoCount === "number" && <span className="text-xs text-slate-600">{photoCount} {photoCount === 1 ? "foto" : "fotos"}</span>}
          </div>
          {children}
        </section>
        <Link href={`/evento/${eventSlug}/enviar`} aria-label="Enviar foto" className="gradient-button fixed right-5 bottom-24 z-30 size-14 rounded-full p-0 shadow-[0_14px_40px_rgba(124,58,237,.45)] sm:hidden">
          <CameraIcon className="size-6" />
        </Link>
        <MobileEventNav eventSlug={eventSlug} active="gallery" />
      </div>
    </AppShell>
  );
}
