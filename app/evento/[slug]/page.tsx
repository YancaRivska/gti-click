import Image from "next/image";
import Link from "next/link";
import { logout } from "@/app/auth/actions";
import {
  AppShell,
  CameraIcon,
  EventArtwork,
  GtiLogo,
  ImageIcon,
  MobileEventNav,
  UploadIcon,
  UsersIcon,
} from "@/components/gti-ui";
import { events } from "@/data/events";
import { requireEventAccess } from "@/lib/event-access";
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

  const { data: eventPhotos } = await supabase
    .from("photo_uploads")
    .select("user_id")
    .eq("event_id", event.id);
  const photoCount = eventPhotos?.length ?? 0;
  const participantCount = new Set(
    eventPhotos?.map((photo) => photo.user_id) ?? [],
  ).size;
  const error = (await searchParams).error;

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-5xl pb-28 lg:px-8 lg:pb-10 lg:pt-6">
        <header className="flex items-center justify-between px-5 py-4 sm:px-7 lg:px-0">
          <GtiLogo size="compact" />
          <span className="live-pill">
            <span className="live-pill-dot" />
            Summit 2026
          </span>
        </header>

        <section className="lg:grid lg:grid-cols-[1.08fr_.92fr] lg:items-stretch lg:gap-8">
          <EventArtwork name={event.nome} date={event.data} location={event.local} />

          <div className="px-5 pt-7 sm:px-7 lg:flex lg:flex-col lg:justify-center lg:px-0 lg:py-5">
            <span className="eyebrow"><span className="eyebrow-dot" />Evento da galera</span>
            <h1 className="mt-4 text-[2.15rem] leading-[0.98] font-black tracking-[-0.055em] text-white sm:text-5xl">
              A Galera do TI tá no Summit! 📸
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              Registre, compartilhe e reviva os melhores momentos com a galera.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <div className="stat-chip">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/12 text-violet-200"><ImageIcon className="size-5" /></span>
                <div><p className="text-xl font-black text-white">{photoCount}</p><p className="text-[0.65rem] text-slate-500">fotos</p></div>
              </div>
              <div className="stat-chip">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-fuchsia-500/10 text-fuchsia-200"><UsersIcon className="size-5" /></span>
                <div><p className="text-xl font-black text-white">{participantCount}</p><p className="text-[0.65rem] text-slate-500">participantes</p></div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-[1.2fr_.8fr] lg:grid-cols-1">
              <Link href={`/evento/${event.slug}/enviar`} className="gradient-button w-full text-base">
                <CameraIcon className="size-5" />Enviar foto
              </Link>
              <Link href={`/evento/${event.slug}/galeria`} className="secondary-button w-full text-base">
                <ImageIcon className="size-5 text-violet-300" />Ver galeria
              </Link>
            </div>

            <div className="event-memory-strip relative mt-6 hidden min-h-32 overflow-hidden p-4 sm:block lg:mt-7">
              <div className="relative z-10 max-w-[66%]">
                <UploadIcon className="size-5 text-violet-300" />
                <p className="mt-3 text-sm font-black text-white">Seu olhar também faz parte.</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Publicou, apareceu. Cada click ajuda a contar a história desse dia.</p>
              </div>
              <div className="absolute -right-1 -bottom-7 h-40 w-40">
                <Image src="/assets/gti-click/mascot-camera.jpg" alt="Mascote GTI CLICK com câmera" fill sizes="8rem" className="object-contain object-bottom mix-blend-screen" />
              </div>
            </div>
          </div>
        </section>

        {error === "revoke" && (
          <p role="alert" className="mx-5 mt-5 rounded-xl border border-red-300/10 bg-red-400/[0.055] px-4 py-3 text-sm text-red-200/85 sm:mx-7 lg:mx-0">
            Não foi possível revogar o consentimento. Tente novamente.
          </p>
        )}

        <footer className="mx-5 mt-8 flex items-center justify-between border-t border-white/7 py-5 text-xs sm:mx-7 lg:mx-0">
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
