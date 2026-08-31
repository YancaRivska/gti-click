import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import {
  AppShell,
  ArrowRightIcon,
  BackLink,
  CameraIcon,
  GtiLogo,
  HeartIcon,
  ImageIcon,
  InstagramIcon,
  SparklesIcon,
} from "@/components/gti-ui";
import { getEventBySlug } from "@/data/events";
import { instagramProfileUrl } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

type Participation = {
  event_id: string;
  access_role: string;
  joined_at: string;
};

export default async function MyGtiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/meu-gti/entrar");
  }

  const [profileResult, historyResult, photosResult, likesResult] = await Promise.all([
    supabase.from("profiles").select("display_name, instagram_handle, created_at").eq("user_id", user.id).maybeSingle(),
    supabase.from("event_participations").select("event_id, access_role, joined_at").eq("user_id", user.id).order("joined_at", { ascending: false }),
    supabase.from("photo_uploads").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("photo_likes").select("photo_id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  let participations = (historyResult.data ?? []) as Participation[];

  if (historyResult.error) {
    const consentHistory = await supabase
      .from("event_consents")
      .select("event_id, consent_date")
      .eq("user_id", user.id)
      .eq("consent_accepted", true)
      .order("consent_date", { ascending: false });

    participations = (consentHistory.data ?? []).map((item) => ({
      event_id: item.event_id,
      access_role: "viewer",
      joined_at: item.consent_date,
    }));
  }

  const profile = profileResult.data;
  const displayName: string = profile?.display_name
    || (typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name : null)
    || user.email?.split("@")[0]
    || "Pessoa da galera";
  const instagram: string | null = profile?.instagram_handle
    || (typeof user.user_metadata?.instagram_handle === "string" ? user.user_metadata.instagram_handle : null);
  const isPermanent = !user.is_anonymous && Boolean(user.email);
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  const history = participations.flatMap((participation) => {
    const event = getEventBySlug(participation.event_id);
    return event ? [{ ...participation, event }] : [];
  });

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-xl px-5 pb-10 pt-5 sm:px-7">
        <header className="flex items-center justify-between">
          <BackLink href="/">Início</BackLink>
          <GtiLogo size="compact" />
        </header>

        <main className="pb-8 pt-7">
          <section className="relative overflow-hidden rounded-[1.75rem] border border-violet-300/12 bg-[linear-gradient(145deg,rgba(124,58,237,.16),rgba(8,7,15,.94)_58%)] p-5 shadow-[0_24px_70px_rgba(0,0,0,.32)]">
            <div className="absolute -right-12 -top-16 size-48 rounded-full bg-fuchsia-500/12 blur-3xl" aria-hidden="true" />
            <p className="event-section-label"><span className="eyebrow-dot" />Minha jornada GTI</p>
            <div className="relative mt-5 flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-violet-200/18 bg-violet-500/14 text-xl font-black text-white shadow-[0_10px_30px_rgba(124,58,237,.18)]">{initials || "GT"}</span>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-black tracking-[-0.04em] text-white">{displayName}</h1>
                {instagram ? (
                  <a href={instagramProfileUrl(instagram)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-fuchsia-300 hover:text-white">
                    <InstagramIcon className="size-3.5" />{instagram}
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">{isPermanent ? user.email : "Acesso rápido ativo"}</p>
                )}
              </div>
            </div>

            {!isPermanent && (
              <div className="relative mt-5 rounded-2xl border border-violet-300/12 bg-black/20 p-4">
                <p className="text-sm font-black text-white">Quer guardar essa história?</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">Crie um perfil opcional e não perca seus eventos quando trocar de celular.</p>
                <Link href="/meu-gti/criar" className="gradient-button mt-4 w-full text-sm">Criar meu perfil <ArrowRightIcon className="size-4" /></Link>
              </div>
            )}
          </section>

          <section className="mt-4 grid grid-cols-3 gap-2">
            <JourneyStat icon={<SparklesIcon className="size-4" />} value={history.length} label="eventos" />
            <JourneyStat icon={<CameraIcon className="size-4" />} value={photosResult.count ?? 0} label="fotos" />
            <JourneyStat icon={<HeartIcon className="size-4" />} value={likesResult.count ?? 0} label="curtidas" />
          </section>

          <section className="mt-8">
            <div className="flex items-end justify-between gap-4">
              <div><p className="event-section-label"><span className="eyebrow-dot" />Memórias</p><h2 className="mt-2 text-xl font-black text-white">Eventos da minha jornada</h2></div>
              <span className="text-xs font-bold text-violet-300">{history.length}</span>
            </div>

            {history.length ? (
              <div className="mt-4 space-y-3">
                {history.map(({ event, joined_at: joinedAt, access_role: accessRole }) => (
                  <article key={event.id} className="overflow-hidden rounded-[1.4rem] border border-white/8 bg-white/[0.025]">
                    <div className="relative h-32">
                      <Image src="/assets/gti-click/aws-summit-header.jpg" alt="AWS Summit São Paulo" fill sizes="36rem" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090711] via-black/20 to-transparent" />
                      <span className="absolute right-3 top-3 rounded-full border border-white/12 bg-black/45 px-2.5 py-1 text-[0.58rem] font-black text-white backdrop-blur-md">
                        {accessRole === "contributor" ? "Cobertura" : "Comunidade"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0"><h3 className="truncate text-sm font-black text-white">{event.nome}</h3><p className="mt-1 text-[0.65rem] text-slate-500">{event.data} · {event.local}</p><p className="mt-1 text-[0.58rem] text-slate-600">Registrado em {new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Sao_Paulo" }).format(new Date(joinedAt))}</p></div>
                      <Link href={`/evento/${event.slug}`} aria-label={`Abrir ${event.nome}`} className="icon-button shrink-0 rounded-full"><ArrowRightIcon className="size-4" /></Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.4rem] border border-dashed border-violet-300/15 bg-violet-500/[0.035] px-5 py-8 text-center">
                <ImageIcon className="mx-auto size-7 text-violet-300" />
                <h3 className="mt-3 text-sm font-black text-white">Sua jornada começa no próximo click</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">Entre em um evento da Galera do TI para ele aparecer aqui.</p>
                <Link href="/evento/entrar" className="secondary-button mt-5 w-full text-sm">Entrar em um evento</Link>
              </div>
            )}
          </section>

          <div className="mt-8 grid gap-2">
            {!isPermanent && <Link href="/meu-gti/entrar" className="secondary-button w-full text-sm">Já tenho um perfil</Link>}
            <form action={logout}><button type="submit" className="min-h-12 w-full text-xs font-bold text-slate-600 transition hover:text-white">Sair</button></form>
          </div>
        </main>
      </div>
    </AppShell>
  );
}

function JourneyStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.025] px-2 py-3 text-center">
      <span className="mx-auto grid size-8 place-items-center rounded-xl bg-violet-500/10 text-violet-300">{icon}</span>
      <strong className="mt-2 block text-lg font-black text-white">{value}</strong>
      <span className="text-[0.58rem] text-slate-500">{label}</span>
    </div>
  );
}
