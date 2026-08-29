import Link from "next/link";
import { redirect } from "next/navigation";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createClient } from "@/lib/supabase/server";
import { acceptConsent } from "./actions";

export default async function ConsentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    redirect("/evento/entrar");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/evento/entrar");
  }

  if (await hasEventConsent(supabase, user.id, event.id)) {
    redirect(`/evento/${event.slug}`);
  }

  const error = (await searchParams).error;

  return (
    <main className="home-shell relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-10">
      <section className="relative z-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0d1a]/95 p-6 shadow-2xl sm:p-9">
        <p className="text-xs font-bold tracking-[0.18em] text-violet-300 uppercase">
          {event.nome}
        </p>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Antes do click 👀
        </h1>

        <div className="mt-7 space-y-5 leading-relaxed text-slate-300">
          <p>
            As fotos enviadas neste evento serão compartilhadas no álbum colaborativo e poderão ser visualizadas e baixadas pelos participantes autorizados.
          </p>
          <p>
            Autorizo a Galera do TI a utilizar as imagens que eu enviar ao GTI CLICK para produção e divulgação de conteúdos relacionados à comunidade, eventos e redes sociais, conforme os termos apresentados.
          </p>
        </div>

        <form action={acceptConsent} className="mt-8">
          <input type="hidden" name="eventSlug" value={event.slug} />
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-slate-200">
            <input
              type="checkbox"
              name="consent"
              required
              className="mt-1 size-4 shrink-0 accent-violet-600"
            />
            <span>
              Li e concordo com os termos de participação e uso de imagem.
            </span>
          </label>

          {error === "required" && (
            <p role="alert" className="mt-3 text-sm text-red-300">
              Você precisa aceitar os termos para continuar.
            </p>
          )}
          {error === "save" && (
            <p role="alert" className="mt-3 text-sm text-red-300">
              Não foi possível registrar o aceite. Tente novamente.
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-violet-300">
            <Link href="/termos" target="_blank" rel="noreferrer">
              Termos de Uso
            </Link>
            <Link href="/privacidade" target="_blank" rel="noreferrer">
              Política de Privacidade
            </Link>
          </div>

          <button
            type="submit"
            className="mt-7 min-h-14 w-full rounded-2xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
          >
            Aceitar e continuar
          </button>
        </form>
      </section>
    </main>
  );
}
