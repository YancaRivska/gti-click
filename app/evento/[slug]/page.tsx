import Link from "next/link";
import { logout } from "@/app/auth/actions";
import {
  AppShell,
  ArrowLeftIcon,
  CameraIcon,
  EventArtwork,
  ImageIcon,
  MobileEventNav,
  UsersIcon,
} from "@/components/gti-ui";
import { events } from "@/data/events";
import { requireEventAccess } from "@/lib/event-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { RevokeConsentButton } from "./revoke-consent-button";

export function generateStaticParams() {
  return events.map((event) => ({ slug: event.slug }));
}

export default async function EventPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { slug } = await params;
  const { event, supabase } = await requireEventAccess(slug);

  const eventPhotosResult = await supabase
    .from("photo_uploads")
    .select("user_id")
    .eq("event_id", event.id)
    .neq("moderation_status", "rejected");
  let eventPhotos = eventPhotosResult.data;

  if (eventPhotosResult.error) {
    const fallback = await supabase
      .from("photo_uploads")
      .select("user_id")
      .eq("event_id", event.id);

    eventPhotos = fallback.data;
  }

  eventPhotos ??= [];
  const photoCount = eventPhotos.length;
  let participantCount = new Set(
    eventPhotos?.map((photo) => photo.user_id) ?? [],
  ).size;

  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("event_consents")
      .select("id", { count: "exact", head: true })
      .eq("event_id", event.id)
      .eq("consent_accepted", true)
      .eq("consent_version", "1.0");

    if (count !== null) {
      participantCount = count;
    }
  } catch {
    // A contagem de autores das fotos continua disponível sem credenciais administrativas.
  }
  const error = (await searchParams).error;

  return (
    <AppShell>
      <div className="event-screen mx-auto min-h-svh w-full max-w-lg pb-28 lg:pb-10">
        <section className="relative">
          <header className="event-topbar">
            <Link href="/evento/entrar" aria-label="Voltar" className="event-topbar-button"><ArrowLeftIcon className="size-5" /></Link>
            <span className="event-topbar-label"><span className="live-pill-dot" />Summit 2026</span>
          </header>
          <EventArtwork name={event.nome} date={event.data} location={event.local} />
        </section>

        <section className="px-5 pt-5 sm:px-7">
            <span className="event-section-label"><span className="eyebrow-dot" />Evento da galera</span>
            <h2 className="mt-3 text-[1.25rem] leading-tight font-black tracking-[-0.025em] text-white sm:text-2xl">
              A Galera do TI tá no Summit! 📸
            </h2>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-slate-400">
              Registre, compartilhe e reviva os melhores momentos com a galera.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="stat-chip">
                <span className="stat-chip-icon"><ImageIcon className="size-4.5" /></span>
                <div><p className="text-lg font-black text-white">{photoCount}</p><p className="text-[0.62rem] text-slate-500">fotos</p></div>
              </div>
              <div className="stat-chip">
                <span className="stat-chip-icon is-pink"><UsersIcon className="size-4.5" /></span>
                <div><p className="text-lg font-black text-white">{participantCount}</p><p className="text-[0.62rem] text-slate-500">participantes</p></div>
              </div>
            </div>

            <div className="mt-4 grid gap-2.5">
              <Link href={`/evento/${event.slug}/enviar`} className="gradient-button w-full text-sm">
                <CameraIcon className="size-5" />Enviar foto
              </Link>
              <Link href={`/evento/${event.slug}/galeria`} className="secondary-button w-full text-sm">
                <ImageIcon className="size-5 text-violet-300" />Ver galeria
              </Link>
            </div>

            <p className="mt-4 text-center text-[0.62rem] text-slate-600">Publicou, apareceu. Essa memória agora é da galera 💜</p>
        </section>

        {error === "revoke" && (
          <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-300/10 bg-red-400/[0.055] px-4 py-3 text-sm text-red-200/85 sm:mx-7">
            Não foi possível revogar o consentimento. Tente novamente.
          </p>
        )}

        <footer className="mx-5 mt-7 flex items-center justify-between border-t border-white/7 py-5 text-xs sm:mx-7">
          <form action={logout}>
            <button type="submit" className="min-h-11 px-2 font-semibold text-slate-600 transition hover:text-white">Sair do evento</button>
          </form>
          <RevokeConsentButton eventSlug={event.slug} />
        </footer>

        <MobileEventNav eventSlug={event.slug} active="event" />
      </div>
    </AppShell>
  );
}
