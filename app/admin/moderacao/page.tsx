import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { hasAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { approvePendingPhoto } from "./actions";
import { DeletePhotoButton } from "./delete-photo-button";

const EVENT_SLUG = "aws-summit-sp-2026";
const SIGNED_URL_DURATION = 60 * 5;

export const dynamic = "force-dynamic";

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  if (!(await hasAdminSession())) {
    redirect("/evento/entrar");
  }

  const event = getEventBySlug(EVENT_SLUG);

  if (!event) {
    redirect("/evento/entrar");
  }

  const admin = createAdminClient();
  const { data: photos, error: photosError } = await admin
    .from("photo_uploads")
    .select("id, storage_path, caption, instagram_handle, created_at")
    .eq("event_id", event.id)
    .eq("moderation_status", "pending")
    .order("created_at", { ascending: true });

  const paths = photos?.map((photo) => photo.storage_path) ?? [];
  const signedResult = paths.length
    ? await admin.storage
        .from("event-photos")
        .createSignedUrls(paths, SIGNED_URL_DURATION)
    : { data: [], error: null };

  const signedUrls = new Map(
    signedResult.data?.map((photo) => [photo.path, photo.signedUrl]) ?? [],
  );
  const visiblePhotos = photos?.flatMap((photo) => {
    const signedUrl = signedUrls.get(photo.storage_path);
    return signedUrl ? [{ ...photo, signedUrl }] : [];
  });
  const query = await searchParams;

  return (
    <main className="home-shell relative min-h-svh overflow-hidden px-5 py-10">
      <section className="relative z-10 mx-auto w-full max-w-6xl">
        <Link
          href={`/evento/${event.slug}`}
          className="text-xs font-bold tracking-[0.18em] text-violet-300"
        >
          ← {event.nome}
        </Link>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Moderar fotos
        </h1>
        <p className="mt-3 text-slate-300">Aprove ou exclua os envios pendentes.</p>

        {(photosError || signedResult.error) && (
          <p role="alert" className="mt-6 text-sm text-red-300">
            Não foi possível carregar as fotos pendentes.
          </p>
        )}
        {query.error && (
          <p role="alert" className="mt-6 text-sm text-red-300">
            Não foi possível concluir essa ação. Tente novamente.
          </p>
        )}

        {!photosError && !signedResult.error && !visiblePhotos?.length && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-slate-300">
            Nenhuma foto aguardando aprovação.
          </div>
        )}

        {visiblePhotos && visiblePhotos.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePhotos.map((photo) => (
              <article key={photo.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d1a]/95 shadow-xl">
                <Image
                  src={photo.signedUrl}
                  alt={photo.caption || "Foto pendente"}
                  width={900}
                  height={900}
                  unoptimized
                  className="aspect-square w-full object-cover"
                />
                <div className="p-4">
                  {photo.caption && <p className="text-white">{photo.caption}</p>}
                  {photo.instagram_handle && (
                    <p className="mt-2 text-sm font-semibold text-violet-300">
                      {photo.instagram_handle}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <form action={approvePendingPhoto}>
                      <input type="hidden" name="photoId" value={photo.id} />
                      <button type="submit" className="min-h-10 rounded-xl bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-500">
                        APROVAR
                      </button>
                    </form>
                    <DeletePhotoButton photoId={photo.id} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
