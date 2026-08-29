import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "event-photos";
const SIGNED_URL_DURATION = 60 * 10;
const DOWNLOAD_URL_DURATION = 60 * 5;

function GalleryMessage({
  children,
  eventSlug,
}: {
  children: React.ReactNode;
  eventSlug: string;
}) {
  return (
    <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-slate-300">
      {children}
      <Link
        href={`/evento/${eventSlug}`}
        className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 font-semibold text-white transition hover:bg-white/5"
      >
        Voltar ao evento
      </Link>
    </div>
  );
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/evento/entrar");
  }

  if (!(await hasEventConsent(supabase, user.id, event.id))) {
    redirect(`/evento/${event.slug}/aceite`);
  }

  const { data: photos, error: photosError } = await supabase
    .from("photo_uploads")
    .select("id, storage_path, caption, instagram_handle, created_at")
    .eq("event_id", event.id)
    .eq("moderation_status", "approved")
    .order("created_at", { ascending: false });

  if (photosError) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug}>
        <GalleryMessage eventSlug={event.slug}>
          <p className="font-semibold text-white">A galeria não carregou.</p>
          <p className="mt-2 text-sm">Tente novamente em alguns instantes.</p>
        </GalleryMessage>
      </GalleryShell>
    );
  }

  if (!photos.length) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug}>
        <GalleryMessage eventSlug={event.slug}>
          <p className="text-3xl" aria-hidden="true">📷</p>
          <p className="mt-3 font-semibold text-white">Ainda não tem foto por aqui.</p>
          <p className="mt-2 text-sm">Que tal publicar o primeiro click?</p>
        </GalleryMessage>
      </GalleryShell>
    );
  }

  const paths = photos.map((photo) => photo.storage_path);
  const [signedResult, downloadResult] = await Promise.all([
    supabase.storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_DURATION),
    supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, DOWNLOAD_URL_DURATION, { download: true }),
  ]);

  if (signedResult.error || downloadResult.error) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug}>
        <GalleryMessage eventSlug={event.slug}>
          <p className="font-semibold text-white">As fotos não puderam ser abertas.</p>
          <p className="mt-2 text-sm">Tente atualizar a página daqui a pouco.</p>
        </GalleryMessage>
      </GalleryShell>
    );
  }

  const signedUrls = new Map(
    signedResult.data.map((photo) => [photo.path, photo.signedUrl]),
  );
  const downloadUrls = new Map(
    downloadResult.data.map((photo) => [photo.path, photo.signedUrl]),
  );
  const visiblePhotos = photos.flatMap((photo) => {
    const signedUrl = signedUrls.get(photo.storage_path);
    const downloadUrl = downloadUrls.get(photo.storage_path);
    return signedUrl && downloadUrl
      ? [{ ...photo, signedUrl, downloadUrl }]
      : [];
  });

  if (!visiblePhotos.length) {
    return (
      <GalleryShell eventName={event.nome} eventSlug={event.slug}>
        <GalleryMessage eventSlug={event.slug}>
          <p className="font-semibold text-white">As fotos estão indisponíveis agora.</p>
          <p className="mt-2 text-sm">Tente novamente em alguns instantes.</p>
        </GalleryMessage>
      </GalleryShell>
    );
  }

  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <GalleryShell eventName={event.nome} eventSlug={event.slug}>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePhotos.map((photo) => (
          <article
            key={photo.id}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d1a]/95 shadow-xl"
          >
            <Image
              src={photo.signedUrl}
              alt={photo.caption || "Foto do evento"}
              width={900}
              height={900}
              unoptimized
              className="aspect-square w-full object-cover"
            />
            <div className="p-4">
              {photo.caption && (
                <p className="leading-relaxed text-white">{photo.caption}</p>
              )}
              {photo.instagram_handle && (
                <p className="mt-2 text-sm font-semibold text-violet-300">
                  {photo.instagram_handle}
                </p>
              )}
              <time
                dateTime={photo.created_at}
                className="mt-2 block text-xs text-slate-500"
              >
                {dateFormatter.format(new Date(photo.created_at))}
              </time>
              <a
                href={photo.downloadUrl}
                download
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl border border-violet-400/30 px-4 text-sm font-semibold text-violet-200 transition hover:bg-violet-400/10"
              >
                Baixar foto
              </a>
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
}: {
  children: React.ReactNode;
  eventName: string;
  eventSlug: string;
}) {
  return (
    <main className="home-shell relative min-h-svh overflow-hidden px-5 py-10">
      <div className="lens" aria-hidden="true" />
      <section className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href={`/evento/${eventSlug}`}
              className="text-xs font-bold tracking-[0.18em] text-violet-300"
            >
              ← {eventName}
            </Link>
            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Galeria da galera
            </h1>
            <p className="mt-3 text-slate-300">Os clicks mais recentes aparecem primeiro.</p>
          </div>
          <Link
            href={`/evento/${eventSlug}/enviar`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-600 px-5 font-semibold text-white transition hover:bg-violet-500"
          >
            Enviar foto
          </Link>
        </div>
        {children}
      </section>
    </main>
  );
}
