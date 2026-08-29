import Link from "next/link";
import { logout } from "@/app/auth/actions";
import {
  AppShell,
  ArrowRightIcon,
  CalendarIcon,
  CameraIcon,
  EventArtwork,
  GtiLogo,
  ImageIcon,
  MapPinIcon,
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
      <div className="mx-auto min-h-svh w-full max-w-7xl px-5 py-5 pb-24 sm:px-8 sm:py-7 lg:px-10 lg:pb-0">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <div className="flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-400/8 px-3 py-1.5 text-[0.68rem] font-bold text-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#4ade80]" />
            Participante conectado
          </div>
        </header>

        <section className="grid gap-8 py-8 lg:grid-cols-[1.08fr_.92fr] lg:items-stretch lg:py-12">
          <EventArtwork name={event.nome} date={event.data} location={event.local} />

          <div className="glass-panel flex flex-col rounded-[1.75rem] p-6 sm:p-8">
            <span className="eyebrow w-fit">
              <span className="eyebrow-dot" />
              Seu evento
            </span>
            <h1 className="mt-5 text-3xl leading-tight font-black tracking-[-0.045em] text-white sm:text-5xl">
              A Galera do TI tá no Summit! 📸
            </h1>
            <p className="mt-4 leading-relaxed text-slate-400">
              Registre, compartilhe e reviva os melhores momentos com a galera.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="soft-panel rounded-2xl p-4">
                <ImageIcon className="size-5 text-violet-300" />
                <p className="mt-3 text-2xl font-black text-white">{photoCount}</p>
                <p className="mt-1 text-xs text-slate-500">fotos na galeria</p>
              </div>
              <div className="soft-panel rounded-2xl p-4">
                <UsersIcon className="size-5 text-violet-300" />
                <p className="mt-3 text-2xl font-black text-white">{participantCount}</p>
                <p className="mt-1 text-xs text-slate-500">participantes no álbum</p>
              </div>
            </div>

            <div className="mt-auto grid gap-3 pt-7 sm:grid-cols-2">
              <Link href={`/evento/${event.slug}/enviar`} className="gradient-button w-full">
                <CameraIcon className="size-5" />
                Enviar foto
              </Link>
              <Link href={`/evento/${event.slug}/galeria`} className="secondary-button w-full">
                <ImageIcon className="size-5 text-violet-300" />
                Ver galeria
              </Link>
            </div>
          </div>
        </section>

        {error === "revoke" && (
          <p role="alert" className="mb-6 rounded-xl border border-red-400/15 bg-red-400/8 px-4 py-3 text-sm text-red-200">
            Não foi possível revogar o consentimento. Tente novamente.
          </p>
        )}

        <section className="grid gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-3">
          <Link href={`/evento/${event.slug}/enviar`} className="action-card group">
            <span className="grid size-11 place-items-center rounded-2xl bg-violet-500/12 text-violet-200">
              <UploadIcon className="size-5" />
            </span>
            <h2 className="mt-5 text-lg font-black text-white">Seu click na galeria</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Envie em poucos passos. A equipe aprova antes da publicação.</p>
            <ArrowRightIcon className="mt-5 size-5 text-violet-300 transition group-hover:translate-x-1" />
          </Link>
          <Link href={`/evento/${event.slug}/galeria`} className="action-card group">
            <span className="grid size-11 place-items-center rounded-2xl bg-fuchsia-500/10 text-fuchsia-200">
              <ImageIcon className="size-5" />
            </span>
            <h2 className="mt-5 text-lg font-black text-white">Memórias da galera</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Veja e baixe os registros aprovados do evento.</p>
            <ArrowRightIcon className="mt-5 size-5 text-fuchsia-300 transition group-hover:translate-x-1" />
          </Link>
          <div className="action-card sm:col-span-2 lg:col-span-1">
            <div className="flex gap-3">
              <CalendarIcon className="mt-0.5 size-5 shrink-0 text-violet-300" />
              <div><p className="text-sm font-bold text-white">{event.data}</p><p className="mt-1 text-xs text-slate-500">Data do evento</p></div>
            </div>
            <div className="mt-5 flex gap-3 border-t border-white/8 pt-5">
              <MapPinIcon className="mt-0.5 size-5 shrink-0 text-violet-300" />
              <div><p className="text-sm font-bold text-white">{event.local}</p><p className="mt-1 text-xs text-slate-500">Localização</p></div>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-white/8 py-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-slate-500 transition hover:text-white">Voltar ao início</Link>
          <div className="flex flex-wrap items-center gap-1">
            <form action={logout}>
              <button type="submit" className="px-3 py-2 font-semibold text-slate-500 transition hover:text-white">Sair</button>
            </form>
            <RevokeConsentButton eventSlug={event.slug} />
          </div>
        </footer>
        <MobileEventNav eventSlug={event.slug} active="event" />
      </div>
    </AppShell>
  );
}
