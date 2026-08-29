import Image from "next/image";
import { redirect } from "next/navigation";
import {
  AppShell,
  BackLink,
  CheckIcon,
  EmptyState,
  GtiLogo,
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
    ? await admin.storage.from("event-photos").createSignedUrls(paths, SIGNED_URL_DURATION)
    : { data: [], error: null };
  const signedUrls = new Map(signedResult.data?.map((photo) => [photo.path, photo.signedUrl]) ?? []);
  const visiblePhotos = photos?.flatMap((photo) => {
    const signedUrl = signedUrls.get(photo.storage_path);
    return signedUrl ? [{ ...photo, signedUrl }] : [];
  }) ?? [];
  const query = await searchParams;
  const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  });

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-6xl px-4 pb-10 pt-5 sm:px-7 lg:px-9">
        <header className="flex items-center justify-between">
          <GtiLogo size="compact" />
          <form action={logoutAdmin}>
            <button type="submit" className="min-h-11 rounded-xl border border-white/8 px-3 text-xs font-bold text-slate-500 transition hover:border-white/15 hover:text-white">Sair da moderação</button>
          </form>
        </header>

        <section className="pt-7">
          <BackLink href="/evento/entrar">Voltar à entrada</BackLink>
          <div className="mt-4 flex items-end justify-between gap-4 border-b border-white/7 pb-6">
            <div>
              <span className="flex items-center gap-2 text-[0.65rem] font-black tracking-[0.13em] text-violet-300 uppercase"><ShieldIcon className="size-4" />Área restrita</span>
              <h1 className="mt-2 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Moderação</h1>
              <p className="mt-2 text-sm text-slate-500">Revise os clicks antes de liberar para a galera.</p>
            </div>
            <span className="flex shrink-0 flex-col items-center rounded-2xl border border-amber-300/10 bg-amber-400/[0.055] px-4 py-2 text-amber-100">
              <strong className="text-2xl leading-none">{visiblePhotos.length}</strong>
              <span className="mt-1 text-[0.58rem] font-bold uppercase">pendentes</span>
            </span>
          </div>

          {(photosError || signedResult.error || query.error) && (
            <p role="alert" className="mt-5 rounded-xl border border-red-300/10 bg-red-400/[0.05] px-4 py-3 text-sm text-red-200/80">Não foi possível concluir essa ação. Tente novamente.</p>
          )}

          {!photosError && !signedResult.error && !visiblePhotos.length && (
            <EmptyState icon={<CheckIcon className="size-6" />} visual={<Image src="/assets/gti-click/mascot-phone.jpg" alt="Mascote GTI CLICK comemorando" fill sizes="10rem" className="object-contain mix-blend-screen" />} title="Tudo revisado por aqui" description="Nenhuma foto está aguardando aprovação neste momento." />
          )}

          {visiblePhotos.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePhotos.map((photo) => (
                <article key={photo.id} className="overflow-hidden rounded-[1.35rem] border border-white/8 bg-[#090810] shadow-[0_20px_55px_rgba(0,0,0,.28)]">
                  <div className="relative">
                    <Image src={photo.signedUrl} alt={photo.caption || "Foto pendente"} width={1000} height={1100} unoptimized sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="aspect-[4/5] w-full object-cover" />
                    <span className="absolute top-3 left-3 rounded-full border border-amber-200/12 bg-black/60 px-3 py-1.5 text-[0.6rem] font-black text-amber-200 backdrop-blur">Aguardando aprovação</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-violet-300">{photo.instagram_handle || "Participante GTI"}</p>
                        <p className={`mt-1.5 text-sm leading-relaxed ${photo.caption ? "text-slate-300" : "italic text-slate-600"}`}>{photo.caption || "Sem legenda."}</p>
                      </div>
                      <time dateTime={photo.created_at} className="shrink-0 text-right text-[0.58rem] leading-relaxed text-slate-600">{dateFormatter.format(new Date(photo.created_at))}</time>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-white/7 pt-4">
                      <form action={approvePendingPhoto}>
                        <input type="hidden" name="photoId" value={photo.id} />
                        <button type="submit" className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/12 bg-emerald-500/[0.08] px-3 text-sm font-black text-emerald-100 transition hover:bg-emerald-500/15"><CheckIcon className="size-4" />Aprovar</button>
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
