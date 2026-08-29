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
import { DeleteOwnPhotoButton } from "./[photoId]/delete-own-photo-button";

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
  const { event, supabase, user } = await requireEventAccess(slug);
  const query = await searchParams;

  const { data: photos, error: photosError } = await supabase
    .from("photo_uploads")
    .select("id, user_id, storage_path, caption, instagram_handle, created_at")
    .eq("event_id", event.id)
    .neq("moderation_status", "rejected")
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

  if (signedResult.error) {
    return (
      <GalleryShell eventSlug={event.slug}>
        <EmptyState icon={<ShieldIcon className="size-6" />} visual={<Image src="/assets/gti-click/error-camera.jpg" alt="Câmera GTI CLICK com alerta" fill sizes="10rem" className="object-contain mix-blend-screen" />} title="Não conseguimos carregar a galeria" description="Os links privados não ficaram disponíveis agora. Tente novamente daqui a pouco." />
      </GalleryShell>
    );
  }

  const signedUrls = new Map(signedResult.data.map((photo) => [photo.path, photo.signedUrl]));
  const downloadUrls = new Map(downloadResult.data?.map((photo) => [photo.path, photo.signedUrl]) ?? []);
  const visiblePhotos = photos.flatMap((photo) => {
    const signedUrl = signedUrls.get(photo.storage_path);
    return signedUrl ? [{ ...photo, signedUrl, downloadUrl: downloadUrls.get(photo.storage_path) }] : [];
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

      <div className="gallery-grid">
        {visiblePhotos.map((photo) => (
          <article key={photo.id} className="gallery-card group">
            <Link href={`/evento/${event.slug}/galeria/${photo.id}`} className="gallery-card-media">
              <Image
                src={photo.signedUrl}
                alt={photo.caption || "Foto do evento"}
                width={720}
                height={900}
                unoptimized
                sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw"
                className="aspect-[4/5] w-full object-cover"
              />
              <span className="gallery-date">{dateFormatter.format(new Date(photo.created_at))}</span>
            </Link>
            <div className="gallery-card-body">
              <div className="flex min-w-0 items-center gap-2">
                <span className="gallery-avatar">{(photo.instagram_handle?.replace("@", "").charAt(0) || "G").toUpperCase()}</span>
                <p className="min-w-0 flex-1 truncate text-[0.72rem] font-black text-white">{photo.instagram_handle || "Equipe GTI"}</p>
              </div>
              <p className={`mt-2 line-clamp-2 min-h-[2.25rem] text-[0.66rem] leading-[1.15rem] ${photo.caption ? "text-slate-400" : "italic text-slate-600"}`}>{photo.caption || "Um click da galera."}</p>
              <div className="mt-3 flex gap-1.5 border-t border-white/6 pt-2.5">
                {photo.downloadUrl ? (
                  <a href={photo.downloadUrl} download className="gallery-card-action" aria-label="Baixar foto">
                    <DownloadIcon className="size-3.5" /><span>Baixar</span>
                  </a>
                ) : (
                  <Link href={`/evento/${event.slug}/galeria/${photo.id}`} className="gallery-card-action" aria-label="Abrir foto para baixar">
                    <DownloadIcon className="size-3.5" /><span>Abrir</span>
                  </Link>
                )}
                {photo.user_id === user.id && <DeleteOwnPhotoButton eventSlug={event.slug} photoId={photo.id} variant="card" />}
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
        <header className="gallery-header flex items-center justify-between px-1.5 pb-4 sm:px-0">
          <Link href={`/evento/${eventSlug}`} aria-label="Voltar ao evento" className="icon-button rounded-full"><ArrowLeftIcon className="size-5" /></Link>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5"><h1 className="text-base font-black text-white">AWS Summit SP</h1><ApertureIcon className="size-3.5 text-violet-400" /></div>
            <p className="mt-0.5 text-[0.62rem] text-slate-600">registros da galera</p>
          </div>
          <span className="gallery-count">{photoCount ?? "—"}</span>
        </header>

        <div className="gallery-toolbar mb-3 flex items-center justify-between px-1 py-2.5 sm:px-0">
          <span className="gallery-tab is-active">Todos</span>
          <span className="text-[0.6rem] font-semibold text-slate-600">mais recentes primeiro</span>
          <span className="flex items-center gap-1.5 text-[0.6rem] text-slate-600"><ShieldIcon className="size-3 text-violet-400" />privado</span>
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
