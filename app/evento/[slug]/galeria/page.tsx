import Image from "next/image";
import Link from "next/link";
import {
  ApertureIcon,
  AppShell,
  ArrowLeftIcon,
  CameraIcon,
  EmptyState,
  ImageIcon,
  MobileEventNav,
  ShieldIcon,
} from "@/components/gti-ui";
import { WatermarkedDownloadButton } from "@/components/watermarked-download-button";
import { PhotoLikeButton } from "@/components/photo-like-button";
import { hasAdminSession } from "@/lib/admin-auth";
import { requireEventAccess } from "@/lib/event-access";
import { isEventUploadOpen } from "@/lib/event-upload";
import { DeleteOwnPhotoButton } from "./[photoId]/delete-own-photo-button";

const BUCKET = "event-photos";
const SIGNED_URL_DURATION = 60 * 10;

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ deleted?: string | string[]; error?: string | string[] }>;
}) {
  const { slug } = await params;
  const { event, supabase, user } = await requireEventAccess(slug);
  const uploadOpen = isEventUploadOpen(event);
  const query = await searchParams;
  const adminSession = await hasAdminSession();

  let { data: photos, error: photosError } = await supabase
    .from("photo_uploads")
    .select("id, user_id, storage_path, caption, instagram_handle, created_at")
    .eq("event_id", event.id)
    .neq("moderation_status", "rejected")
    .order("created_at", { ascending: false });

  if (photosError) {
    const fallback = await supabase
      .from("photo_uploads")
      .select("id, user_id, storage_path, caption, instagram_handle, created_at")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false });

    photos = fallback.data;
    photosError = fallback.error;
  }

  photos ??= [];

  if (photosError) {
    return (
      <GalleryShell eventSlug={event.slug}>
        <EmptyState icon={<ImageIcon className="size-6" />} title="Não conseguimos carregar a galeria" description="Tente novamente em alguns instantes. Seus clicks continuam protegidos.">
          <Link href={`/evento/${event.slug}`} className="secondary-button mt-6">Voltar ao evento</Link>
        </EmptyState>
      </GalleryShell>
    );
  }

  if (!photos.length) {
    return (
      <GalleryShell eventSlug={event.slug} photoCount={0}>
        <EmptyState icon={<CameraIcon className="size-6" />} title="Nenhum click por aqui ainda" description="Seja o primeiro a registrar esse momento.">
          <Link
            href={uploadOpen ? `/evento/${event.slug}/enviar` : `/evento/${event.slug}`}
            className="gradient-button mt-6"
          >
            {uploadOpen ? "Enviar uma foto" : "Voltar ao evento"}
          </Link>
        </EmptyState>
      </GalleryShell>
    );
  }

  const paths = photos.map((photo) => photo.storage_path);
  const signedResult = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_DURATION);

  if (signedResult.error) {
    return (
      <GalleryShell eventSlug={event.slug}>
        <EmptyState icon={<ShieldIcon className="size-6" />} title="Não conseguimos carregar a galeria" description="Os links privados não ficaram disponíveis agora. Tente novamente daqui a pouco." />
      </GalleryShell>
    );
  }

  const signedUrls = new Map(signedResult.data.map((photo) => [photo.path, photo.signedUrl]));
  const visiblePhotos = photos.flatMap((photo) => {
    const signedUrl = signedUrls.get(photo.storage_path);
    return signedUrl ? [{ ...photo, signedUrl }] : [];
  });

  if (!visiblePhotos.length) {
    return (
      <GalleryShell eventSlug={event.slug}>
        <EmptyState icon={<ImageIcon className="size-6" />} title="Fotos indisponíveis agora" description="Tente novamente em alguns instantes." />
      </GalleryShell>
    );
  }

  const likesResult = await supabase
    .from("photo_likes")
    .select("photo_id, user_id")
    .in("photo_id", visiblePhotos.map((photo) => photo.id));
  const likesEnabled = !likesResult.error;
  const likesByPhoto = new Map<string, { count: number; liked: boolean }>();

  for (const like of likesResult.data ?? []) {
    const current = likesByPhoto.get(like.photo_id) ?? { count: 0, liked: false };
    current.count += 1;
    current.liked ||= like.user_id === user.id;
    likesByPhoto.set(like.photo_id, current);
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
      {query.error === "delete" && (
        <p role="alert" className="mb-4 rounded-xl border border-red-300/10 bg-red-400/[0.05] px-3 py-2.5 text-xs text-red-200/85">Não foi possível excluir. Confira o código administrativo e tente novamente.</p>
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
              {(photo.instagram_handle || photo.caption) && (
                <div className="gallery-card-overlay">
                  {photo.instagram_handle && <p className="truncate text-[0.68rem] font-black text-white">{photo.instagram_handle}</p>}
                  {photo.caption && <p className="mt-0.5 line-clamp-1 text-[0.58rem] text-white/65">{photo.caption}</p>}
                </div>
              )}
            </Link>
            <PhotoLikeButton
              photoId={photo.id}
              initialLiked={likesByPhoto.get(photo.id)?.liked ?? false}
              initialCount={likesByPhoto.get(photo.id)?.count ?? 0}
              variant="card"
              enabled={likesEnabled}
            />
            <div className="gallery-card-body">
              <div className="flex gap-1.5">
                <WatermarkedDownloadButton
                  eventSlug={event.slug}
                  photoId={photo.id}
                  variant="card"
                />
                <DeleteOwnPhotoButton
                  eventSlug={event.slug}
                  photoId={photo.id}
                  variant="card"
                  requiresAdminCode={photo.user_id !== user.id && !adminSession}
                />
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
        <header className="gallery-event-banner">
          <Image
            src="/assets/gti-click/aws-summit-header.jpg"
            alt="AWS Summit São Paulo"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 80rem"
            className="gallery-event-banner-image object-cover"
          />
          <div className="gallery-event-banner-shade" aria-hidden="true" />
          <div className="gallery-event-banner-controls">
            <Link href={`/evento/${eventSlug}`} aria-label="Voltar ao evento" className="icon-button rounded-full"><ArrowLeftIcon className="size-5" /></Link>
            <span className="gallery-count" aria-label={`${photoCount ?? 0} fotos`}>{photoCount ?? "—"}</span>
          </div>
          <div className="gallery-event-banner-caption">
            <h1 className="sr-only">AWS Summit São Paulo</h1>
            <span><ApertureIcon className="size-3.5" />registros da galera</span>
          </div>
        </header>

        <div className="gallery-toolbar mb-3 flex items-center justify-between px-1 py-2.5 sm:px-0">
          <span className="gallery-tab is-active">Todos</span>
          <span className="text-[0.6rem] font-semibold text-slate-600">mais recentes primeiro</span>
          <span className="flex items-center gap-1.5 text-[0.6rem] text-slate-600"><ShieldIcon className="size-3 text-violet-400" />privado</span>
        </div>

        {children}

        <MobileEventNav eventSlug={eventSlug} active="gallery" />
      </div>
    </AppShell>
  );
}
