import Image from "next/image";
import Link from "next/link";
import {
  ApertureIcon,
  AppShell,
  ArrowLeftIcon,
  CameraIcon,
  DownloadIcon,
  EmptyState,
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
      <GalleryShell eventSlug={event.slug}>
        <EmptyState icon={<ImageIcon className="size-6" />} visual={<Image src="/assets/gti-click/error-camera.jpg" alt="Câmera GTI CLICK com alerta" fill sizes="10rem" className="object-contain mix-blend-screen" />} title="Não conseguimos carregar a galeria" description="Tente novamente em alguns instantes. Seus clicks continuam protegidos.">
          <Link href={`/evento/${event.slug}`} className="secondary-button mt-6">Voltar ao evento</Link>
        </EmptyState>
      </GalleryShell>
    );
  }

  if (!photos.length) {
    return (
      <GalleryShell eventSlug={event.slug} photoCount={0}>
        <EmptyState icon={<CameraIcon className="size-6" />} visual={<Image src="/assets/gti-click/mascot-camera.jpg" alt="Mascote GTI CLICK com câmera" fill sizes="10rem" className="object-contain mix-blend-screen" />} title="Nenhum click por aqui ainda" description="Seja o primeiro a registrar esse momento.">
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
      <GalleryShell eventSlug={event.slug}>
        <EmptyState icon={<ShieldIcon className="size-6" />} visual={<Image src="/assets/gti-click/error-camera.jpg" alt="Câmera GTI CLICK com alerta" fill sizes="10rem" className="object-contain mix-blend-screen" />} title="Não conseguimos carregar a galeria" description="Os links privados não ficaram disponíveis agora. Tente novamente daqui a pouco." />
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
      <GalleryShell eventSlug={event.slug}>
        <EmptyState icon={<ImageIcon className="size-6" />} visual={<Image src="/assets/gti-click/error-camera.jpg" alt="Câmera GTI CLICK com alerta" fill sizes="10rem" className="object-contain mix-blend-screen" />} title="Fotos indisponíveis agora" description="Tente novamente em alguns instantes." />
      </GalleryShell>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <GalleryShell eventSlug={event.slug} photoCount={visiblePhotos.length}>
      {query.deleted === "1" && (
        <p role="status" className="mb-4 rounded-xl border border-emerald-300/10 bg-emerald-400/[0.055] px-3 py-2.5 text-xs text-emerald-100/85">Foto excluída com sucesso.</p>
      )}

      <div className="gallery-wall">
        {visiblePhotos.map((photo, index) => (
          <article key={photo.id} className="gallery-tile group">
            <Link href={`/evento/${event.slug}/galeria/${photo.id}`} className="relative block">
              <Image
                src={photo.signedUrl}
                alt={photo.caption || "Foto do evento"}
                width={900}
                height={1100}
                unoptimized
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className={`${index % 5 === 0 ? "aspect-[3/4]" : index % 4 === 0 ? "aspect-[4/5]" : "aspect-square"} w-full object-cover`}
              />
              {(photo.instagram_handle || photo.caption) && (
                <div className="gallery-tile-overlay pr-12">
                  {photo.instagram_handle && <p className="truncate text-[0.68rem] font-black text-white">{photo.instagram_handle}</p>}
                  {photo.caption && <p className="mt-0.5 line-clamp-1 text-[0.58rem] text-white/65">{photo.caption}</p>}
                </div>
              )}
            </Link>
            <span className="absolute top-2 left-2 rounded-full bg-black/48 px-2 py-1 text-[0.54rem] font-semibold text-white/70 backdrop-blur">{dateFormatter.format(new Date(photo.created_at))}</span>
            <a href={photo.downloadUrl} download aria-label="Baixar foto" className="gallery-download"><DownloadIcon className="size-4" /></a>
          </article>
        ))}
      </div>
    </GalleryShell>
  );
}

function GalleryShell({
  children,
  eventSlug,
  photoCount,
}: {
  children: React.ReactNode;
  eventSlug: string;
  photoCount?: number;
}) {
  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-7xl px-2.5 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-10">
        <header className="flex items-center justify-between px-1.5 pb-4 sm:px-0">
          <Link href={`/evento/${eventSlug}`} aria-label="Voltar ao evento" className="icon-button rounded-full"><ArrowLeftIcon className="size-5" /></Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5"><h1 className="text-base font-black text-white">AWS Summit SP</h1><ApertureIcon className="size-3.5 text-violet-400" /></div>
            <p className="mt-0.5 text-[0.62rem] text-slate-600">registros da galera</p>
          </div>
          <span className="grid size-11 place-items-center rounded-full border border-white/8 bg-white/[0.03] text-[0.63rem] font-black text-violet-300">{photoCount ?? "—"}</span>
        </header>

        <div className="mb-3 flex items-center justify-between border-y border-white/6 px-1 py-2.5 sm:px-0">
          <span className="rounded-full bg-violet-600 px-3.5 py-1.5 text-[0.65rem] font-black text-white shadow-[0_8px_22px_rgba(124,58,237,.22)]">Todos</span>
          <span className="flex items-center gap-1.5 text-[0.6rem] text-slate-600"><ShieldIcon className="size-3 text-violet-400" />álbum privado</span>
        </div>

        {children}

        <Link href={`/evento/${eventSlug}/enviar`} aria-label="Enviar foto" className="gradient-button fixed right-5 bottom-24 z-30 size-14 rounded-full p-0 shadow-[0_14px_40px_rgba(124,58,237,.5)] sm:right-8 lg:hidden">
          <CameraIcon className="size-6" />
        </Link>
        <MobileEventNav eventSlug={eventSlug} active="gallery" />
      </div>
    </AppShell>
  );
}
