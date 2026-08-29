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

  const { data: approvedPhotos } = await supabase
    .from("photo_uploads")
    .select("user_id")
    .eq("event_id", event.id)
    .eq("moderation_status", "approved");
  const photoCount = approvedPhotos?.length ?? 0;
  const participantCount = new Set(
    approvedPhotos?.map((photo) => photo.user_id) ?? [],
  ).size;
  const error = (await searchParams).error;

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-5xl pb-28 lg:px-8 lg:pb-10 lg:pt-6">
        <header className="flex items-center justify-between px-5 py-4 sm:px-7 lg:px-0">
          <GtiLogo size="compact" />
          <span className="flex items-center gap-2 rounded-full border border-emerald-300/12 bg-emerald-400/[0.055] px-3 py-1.5 text-[0.65rem] font-bold text-emerald-200/90">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#4ade80]" />
            Evento liberado
          </span>
        </header>

        <section className="lg:grid lg:grid-cols-[1.06fr_.94fr] lg:gap-7">
          <EventArtwork name={event.nome} date={event.data} location={event.local} />

          <div className="px-5 pt-7 sm:px-7 lg:flex lg:flex-col lg:px-0 lg:pt-3">
            <span className="eyebrow"><span className="eyebrow-dot" />Evento da galera</span>
            <h1 className="mt-4 text-[2.15rem] leading-[0.98] font-black tracking-[-0.055em] text-white sm:text-5xl">
              A Galera do TI tá no Summit! 📸
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-400 sm:text-base">
              Registre, compartilhe e reviva os melhores momentos com a galera.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="stat-chip">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-500/12 text-violet-200"><ImageIcon className="size-5" /></span>
                <div><p className="text-xl font-black text-white">{photoCount}</p><p className="text-[0.65rem] text-slate-500">fotos</p></div>
              </div>
              <div className="stat-chip">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-fuchsia-500/10 text-fuchsia-200"><UsersIcon className="size-5" /></span>
                <div><p className="text-xl font-black text-white">{participantCount}</p><p className="text-[0.65rem] text-slate-500">participantes</p></div>
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              <Link href={`/evento/${event.slug}/enviar`} className="gradient-button w-full text-base">
                <CameraIcon className="size-5" />Enviar foto
              </Link>
              <Link href={`/evento/${event.slug}/galeria`} className="secondary-button w-full text-base">
                <ImageIcon className="size-5 text-violet-300" />Ver galeria
              </Link>
            </div>

            <div className="relative mt-6 hidden min-h-32 overflow-hidden rounded-2xl border border-white/7 bg-white/[0.025] p-4 sm:block lg:mt-auto">
              <div className="relative z-10 max-w-[64%]">
                <UploadIcon className="size-5 text-violet-300" />
                <p className="mt-3 text-sm font-black text-white">Seu olhar também faz parte.</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Cada click aprovado ajuda a contar a história desse dia.</p>
              </div>
              <div className="absolute right-2 bottom-0 h-32 w-32">
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
