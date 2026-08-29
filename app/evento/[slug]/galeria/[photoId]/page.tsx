import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AppShell,
  BackLink,
  DownloadIcon,
  FlagIcon,
  GtiLogo,
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

  const { data: photo } = await supabase
    .from("photo_uploads")
    .select("id, user_id, storage_path, caption, instagram_handle, created_at")
    .eq("id", photoId)
    .eq("event_id", event.id)
    .eq("moderation_status", "approved")
    .maybeSingle();

  if (!photo) {
    notFound();
  }

  const extension = photo.storage_path.split(".").pop()?.toLowerCase();
  const safeExtension = ["jpg", "png", "webp"].includes(extension ?? "")
    ? extension
    : "jpg";
  const downloadName = `gti-click-${photo.id}.${safeExtension}`;
  const [signedResult, downloadResult, relatedResult] = await Promise.all([
    supabase.storage.from(BUCKET).createSignedUrl(photo.storage_path, SIGNED_URL_DURATION),
    supabase.storage.from(BUCKET).createSignedUrl(photo.storage_path, DOWNLOAD_URL_DURATION, { download: downloadName }),
    supabase
      .from("photo_uploads")
      .select("id, storage_path, caption")
      .eq("event_id", event.id)
      .eq("moderation_status", "approved")
      .neq("id", photo.id)
      .order("created_at", { ascending: false })
      .limit(3),
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
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });
  const reportSubject = encodeURIComponent(`Reportar foto ${photo.id} — GTI CLICK`);
  const reportBody = encodeURIComponent(`Olá, equipe GTI. Gostaria de reportar a foto ${photo.id} do evento ${event.nome}.`);
  const query = await searchParams;

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-7xl px-4 py-5 pb-24 sm:px-8 sm:py-7 lg:px-10 lg:pb-0">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <span className="flex items-center gap-2 text-[0.65rem] font-bold text-slate-500 sm:text-xs">
            <ShieldIcon className="size-4 text-violet-300" />
            Foto privada
          </span>
        </header>

        <section className="py-8 sm:py-11">
          <BackLink href={`/evento/${event.slug}/galeria`}>Voltar à galeria</BackLink>

          {query.error === "delete" && (
            <p role="alert" className="mt-5 rounded-xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-200">
              Não conseguimos excluir essa foto. Tente novamente.
            </p>
          )}

          <div className="mt-7 grid gap-6 lg:grid-cols-[1.35fr_.65fr] lg:gap-8">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/9 bg-black/35 shadow-[0_30px_90px_rgba(0,0,0,.42)]">
              <Image
                src={signedResult.data.signedUrl}
                alt={photo.caption || "Foto do evento"}
                width={1600}
                height={1200}
                unoptimized
                priority
                sizes="(max-width: 1024px) 100vw, 68vw"
                className="max-h-[78svh] min-h-72 w-full object-contain"
              />
            </div>

            <aside className="glass-panel flex flex-col rounded-[1.5rem] p-5 sm:p-7">
              <span className="eyebrow w-fit"><span className="eyebrow-dot" />Click aprovado</span>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 text-sm font-black text-white">
                  {(photo.instagram_handle?.replace("@", "").charAt(0) || "G").toUpperCase()}
                </span>
                <div>
                  <p className="font-black text-white">{photo.instagram_handle || "Participante GTI"}</p>
                  <time dateTime={photo.created_at} className="mt-1 block text-xs text-slate-500">{dateFormatter.format(new Date(photo.created_at))}</time>
                </div>
              </div>

              {photo.caption ? (
                <p className="mt-7 border-t border-white/8 pt-6 leading-relaxed text-slate-200">{photo.caption}</p>
              ) : (
                <p className="mt-7 border-t border-white/8 pt-6 text-sm italic text-slate-600">Esse click fala por si só.</p>
              )}

              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap lg:grid">
                <a href={downloadResult.data.signedUrl} download className="gradient-button w-full">
                  <DownloadIcon className="size-5" />
                  Baixar foto
                </a>
                <div className="flex gap-3">
                  <SharePhotoButton />
                  <a
                    href={`mailto:administracao@galeradoti.com?subject=${reportSubject}&body=${reportBody}`}
                    className="secondary-button flex-1 text-red-200/75 hover:border-red-300/20 hover:bg-red-400/5 sm:flex-none"
                  >
                    <FlagIcon className="size-4" />
                    Reportar
                  </a>
                </div>
                {photo.user_id === user.id && (
                  <DeleteOwnPhotoButton eventSlug={event.slug} photoId={photo.id} />
                )}
              </div>

              <div className="mt-auto flex items-start gap-2 border-t border-white/8 pt-7 text-xs leading-relaxed text-slate-600">
                <ShieldIcon className="mt-0.5 size-4 shrink-0 text-violet-300" />
                O download usa um link temporário. O arquivo original continua privado.
              </div>
            </aside>
          </div>

          {relatedPhotos.length > 0 && (
            <section className="mt-12 border-t border-white/8 pt-8">
              <div className="flex items-end justify-between gap-4">
                <div><p className="text-xs font-black tracking-[0.14em] text-violet-300 uppercase">Continue vivendo</p><h2 className="mt-2 text-2xl font-black text-white">Mais fotos do evento</h2></div>
                <Link href={`/evento/${event.slug}/galeria`} className="text-xs font-bold text-violet-300 transition hover:text-white">Ver todas</Link>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-5">
                {relatedPhotos.map((item) => (
                  <Link key={item.id} href={`/evento/${event.slug}/galeria/${item.id}`} className="group overflow-hidden rounded-2xl border border-white/8 bg-[#0a0814]">
                    <Image src={item.signedUrl} alt={item.caption || "Foto do evento"} width={600} height={600} unoptimized className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>
        <MobileEventNav eventSlug={event.slug} active="gallery" />
      </div>
    </AppShell>
  );
}
