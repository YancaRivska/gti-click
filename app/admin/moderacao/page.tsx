import Image from "next/image";
import { redirect } from "next/navigation";
import {
  AppShell,
  BackLink,
  CheckIcon,
  EmptyState,
  GtiLogo,
  ImageIcon,
  ShieldIcon,
} from "@/components/gti-ui";
import { getEventBySlug } from "@/data/events";
import { hasAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { approvePendingPhoto, logoutAdmin } from "./actions";
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
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-7xl px-5 py-5 sm:px-8 sm:py-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <div className="flex items-center gap-4">
            <GtiLogo href="/" />
            <span className="hidden rounded-full border border-amber-300/15 bg-amber-400/8 px-3 py-1 text-[0.65rem] font-black tracking-[0.12em] text-amber-200 uppercase sm:inline-flex">
              Área restrita
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-bold text-slate-500 sm:flex">
              <ShieldIcon className="size-4 text-violet-300" />
              Sessão administrativa
            </span>
            <form action={logoutAdmin}>
              <button type="submit" className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-bold text-slate-400 transition hover:border-white/20 hover:text-white">
                Sair
              </button>
            </form>
          </div>
        </header>

        <section className="py-8 sm:py-11">
          <BackLink href="/evento/entrar">Voltar à entrada</BackLink>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="eyebrow"><span className="eyebrow-dot" />Curadoria GTI</span>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">Moderação</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">Revise cada envio antes de liberar para a galeria do evento.</p>
            </div>
            <div className="soft-panel min-w-36 rounded-2xl p-4">
              <p className="text-2xl font-black text-white">{visiblePhotos?.length ?? 0}</p>
              <p className="mt-1 text-xs text-slate-500">aguardando revisão</p>
            </div>
          </div>

          {(photosError || signedResult.error) && (
            <p role="alert" className="mt-7 rounded-xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-200">Não foi possível carregar as fotos pendentes.</p>
          )}
          {query.error && (
            <p role="alert" className="mt-7 rounded-xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-200">Não foi possível concluir essa ação. Tente novamente.</p>
          )}

          {!photosError && !signedResult.error && !visiblePhotos?.length && (
            <EmptyState icon={<CheckIcon className="size-6" />} visual={<Image src="/assets/gti-click/mascot-phone.jpg" alt="Mascote GTI CLICK comemorando" fill sizes="8rem" className="object-contain mix-blend-screen" />} title="Tudo revisado por aqui" description="Nenhuma foto está aguardando aprovação neste momento." />
          )}

          {visiblePhotos && visiblePhotos.length > 0 && (
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visiblePhotos.map((photo, index) => (
                <article key={photo.id} className="photo-card">
                  <div className="relative">
                    <Image src={photo.signedUrl} alt={photo.caption || "Foto pendente"} width={900} height={900} unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw" className={`${index % 4 === 0 ? "aspect-[4/5]" : "aspect-square"} w-full object-cover`} />
                    <span className="absolute top-3 left-3 rounded-full border border-amber-300/20 bg-[#1a1105]/90 px-3 py-1.5 text-[0.62rem] font-black tracking-[0.1em] text-amber-200 uppercase backdrop-blur">Pendente</span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {photo.instagram_handle && <p className="truncate text-sm font-black text-violet-300">{photo.instagram_handle}</p>}
                        {photo.caption ? <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300">{photo.caption}</p> : <p className="mt-2 text-sm italic text-slate-600">Sem legenda.</p>}
                      </div>
                      <ImageIcon className="size-4 shrink-0 text-slate-600" />
                    </div>
                    <time dateTime={photo.created_at} className="mt-4 block border-t border-white/7 pt-4 text-xs text-slate-600">Enviada em {dateFormatter.format(new Date(photo.created_at))}</time>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <form action={approvePendingPhoto}>
                        <input type="hidden" name="photoId" value={photo.id} />
                        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/15 bg-emerald-500/12 px-4 text-sm font-black text-emerald-100 transition hover:bg-emerald-500/20">
                          <CheckIcon className="size-4" />
                          Aprovar
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
      </div>
    </AppShell>
  );
}
