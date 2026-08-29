import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AppShell,
  ArrowLeftIcon,
  DownloadIcon,
  FlagIcon,
  MobileEventNav,
  ShieldIcon,
} from "@/components/gti-ui";
import { requireEventAccess } from "@/lib/event-access";
import { DeleteOwnPhotoButton } from "./delete-own-photo-button";
import { SharePhotoButton } from "./share-photo-button";

const BUCKET = "event-photos";
const SIGNED_URL_DURATION = 60 * 10;
const DOWNLOAD_URL_DURATION = 60 * 5;

export default async function PhotoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; photoId: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { slug, photoId } = await params;
  const { event, supabase, user } = await requireEventAccess(slug);

  let { data: photo, error: photoError } = await supabase
    .from("photo_uploads")
    .select("id, user_id, storage_path, caption, instagram_handle, created_at")
    .eq("id", photoId)
    .eq("event_id", event.id)
    .neq("moderation_status", "rejected")
    .maybeSingle();

  if (photoError) {
    const fallback = await supabase
      .from("photo_uploads")
      .select("id, user_id, storage_path, caption, instagram_handle, created_at")
      .eq("id", photoId)
      .eq("event_id", event.id)
      .maybeSingle();

    photo = fallback.data;
    photoError = fallback.error;
  }

  if (photoError || !photo) {
    notFound();
  }

  const extension = photo.storage_path.split(".").pop()?.toLowerCase();
  const safeExtension = ["jpg", "png", "webp"].includes(extension ?? "") ? extension : "jpg";
  const downloadName = `gti-click-${photo.id}.${safeExtension}`;
  const [signedResult, downloadResult, relatedResult] = await Promise.all([
    supabase.storage.from(BUCKET).createSignedUrl(photo.storage_path, SIGNED_URL_DURATION),
    supabase.storage.from(BUCKET).createSignedUrl(photo.storage_path, DOWNLOAD_URL_DURATION, { download: downloadName }),
    supabase.from("photo_uploads").select("id, storage_path, caption").eq("event_id", event.id).neq("moderation_status", "rejected").neq("id", photo.id).order("created_at", { ascending: false }).limit(5),
  ]);

  if (signedResult.error || downloadResult.error) {
    notFound();
  }

  const relatedPaths = relatedResult.data?.map((item) => item.storage_path) ?? [];
  const relatedSigned = relatedPaths.length
    ? await supabase.storage.from(BUCKET).createSignedUrls(relatedPaths, SIGNED_URL_DURATION)
    : { data: [], error: null };
  const relatedUrls = new Map(relatedSigned.data?.map((item) => [item.path, item.signedUrl]) ?? []);
  const relatedPhotos = relatedResult.data?.flatMap((item) => {
    const signedUrl = relatedUrls.get(item.storage_path);
    return signedUrl ? [{ ...item, signedUrl }] : [];
  }) ?? [];

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
  const reportSubject = encodeURIComponent(`Reportar foto ${photo.id} — GTI CLICK`);
  const reportBody = encodeURIComponent(`Olá, equipe GTI. Gostaria de reportar a foto ${photo.id} do evento ${event.nome}.`);
  const query = await searchParams;

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-xl pb-28 lg:pb-10">
        <header className="photo-detail-header px-4 py-4 sm:px-7">
          <Link href={`/evento/${event.slug}/galeria`} aria-label="Voltar à galeria" className="icon-button rounded-full"><ArrowLeftIcon className="size-5" /></Link>
          <span className="photo-author-avatar">
            {(photo.instagram_handle?.replace("@", "").charAt(0) || "G").toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-white">{photo.instagram_handle || "Equipe GTI"}</p>
            <time dateTime={photo.created_at} className="mt-0.5 block text-[0.62rem] text-slate-600">{dateFormatter.format(new Date(photo.created_at))}</time>
          </div>
          <span aria-hidden="true" className="grid size-11 place-items-center text-xl tracking-[0.18em] text-slate-500">•••</span>
        </header>

        {query.error === "delete" && (
          <p role="alert" className="mx-4 mb-3 rounded-xl border border-red-300/10 bg-red-400/[0.05] px-3 py-2.5 text-xs text-red-200/80 sm:mx-7">Não conseguimos excluir essa foto. Tente novamente.</p>
        )}

        <div className="mx-3 overflow-hidden rounded-[1.35rem] bg-black/38 shadow-[0_24px_70px_rgba(0,0,0,.42)] sm:mx-7">
          <Image src={signedResult.data.signedUrl} alt={photo.caption || "Foto do evento"} width={1600} height={1400} unoptimized priority sizes="(max-width: 768px) 100vw, 48rem" className="max-h-[72svh] min-h-80 w-full object-contain" />
        </div>

        <section className="px-4 pt-4 sm:px-7">
          <div className="media-action-bar">
            <a href={downloadResult.data.signedUrl} download className="media-action media-action-primary"><DownloadIcon className="size-5" />Baixar</a>
            <SharePhotoButton />
            {photo.user_id === user.id ? (
              <DeleteOwnPhotoButton eventSlug={event.slug} photoId={photo.id} />
            ) : (
              <a href={`mailto:administracao@galeradoti.com?subject=${reportSubject}&body=${reportBody}`} className="media-action media-action-secondary"><FlagIcon className="size-5" />Reportar</a>
            )}
          </div>

          {photo.caption ? <p className="py-5 text-sm leading-relaxed text-slate-300"><span className="mr-2 font-black text-white">{photo.instagram_handle || "GTI CLICK"}</span>{photo.caption}</p> : <p className="py-5 text-sm italic text-slate-600">Esse click fala por si só.</p>}

          <div className="flex items-start gap-2 rounded-xl bg-violet-500/[0.045] px-3 py-2.5 text-[0.65rem] leading-relaxed text-slate-600">
            <ShieldIcon className="mt-0.5 size-3.5 shrink-0 text-violet-300" />O download usa um link temporário. A foto continua privada.
          </div>

        </section>

        {relatedPhotos.length > 0 && (
          <section className="mt-8 border-t border-white/7 px-4 pt-6 sm:px-7">
            <div className="flex items-center justify-between"><h2 className="text-base font-black text-white">Mais desse evento</h2><Link href={`/evento/${event.slug}/galeria`} className="text-xs font-bold text-violet-300">Ver tudo</Link></div>
            <div className="-mx-4 mt-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-2 sm:-mx-7 sm:px-7">
              {relatedPhotos.map((item) => (
                <Link key={item.id} href={`/evento/${event.slug}/galeria/${item.id}`} className="relative aspect-[4/5] w-28 shrink-0 snap-start overflow-hidden rounded-xl bg-[#0a0814] sm:w-36">
                  <Image src={item.signedUrl} alt={item.caption || "Foto do evento"} fill unoptimized sizes="9rem" className="object-cover transition duration-300 hover:scale-[1.03]" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <MobileEventNav eventSlug={event.slug} active="gallery" />
      </div>
    </AppShell>
  );
}
