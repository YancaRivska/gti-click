import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { events, getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createClient } from "@/lib/supabase/server";
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
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const callbackUrl = `/evento/${event.slug}`;
    redirect(`/login?next=${encodeURIComponent(callbackUrl)}`);
  }

  if (!(await hasEventConsent(supabase, user.id, event.id))) {
    redirect(`/evento/${event.slug}/aceite`);
  }

  const name =
    user.user_metadata.full_name ??
    user.user_metadata.name ??
    "Participante";
  const avatar = user.user_metadata.avatar_url ?? user.user_metadata.picture;
  const error = (await searchParams).error;

  return (
    <main className="home-shell relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-10">
      <div className="lens" aria-hidden="true" />

      <section className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b0d1a]/90 p-6 shadow-2xl backdrop-blur-sm sm:p-9">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold tracking-[0.18em] text-violet-300 uppercase">
            GTI CLICK
          </p>
          <div className="flex items-center gap-3 text-sm font-semibold text-white">
            {typeof avatar === "string" && (
              <Image
                src={avatar}
                alt=""
                width={36}
                height={36}
                unoptimized
                className="size-9 rounded-full object-cover"
              />
            )}
            <span>{String(name)}</span>
          </div>
        </div>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
          {event.nome}
        </h1>
        <div className="mt-6 flex flex-col gap-2 text-slate-300 sm:flex-row sm:gap-5">
          <span>{event.data}</span>
          <span>{event.local}</span>
        </div>
        <p className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-300">
          Compartilhe seus clicks e acompanhe as memórias registradas pela galera.
        </p>
        {error === "revoke" && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            Não foi possível revogar o consentimento. Tente novamente.
          </p>
        )}
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href={`/evento/${event.slug}/enviar`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-600 px-5 font-semibold text-white transition hover:bg-violet-500"
          >
            Enviar foto
          </Link>
          <Link
            href={`/evento/${event.slug}/galeria`}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-violet-400/30 px-5 font-semibold text-violet-200 transition hover:bg-violet-400/10"
          >
            Ver galeria
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-5 font-semibold text-white transition hover:bg-white/5"
          >
            Voltar ao início
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="min-h-12 rounded-xl px-5 font-semibold text-slate-400 transition hover:text-white"
            >
              Sair
            </button>
          </form>
          <RevokeConsentButton eventSlug={event.slug} />
        </div>
      </section>
    </main>
  );
}
