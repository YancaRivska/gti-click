import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AppShell,
  BackLink,
  CheckIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/gti-ui";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { getEventAccessRole } from "@/lib/event-access-session";
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

  if (!(await getEventAccessRole(event.slug))) {
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
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-xl flex-col px-5 pb-8 pt-5 sm:px-8">
        <header className="flex items-center justify-between">
          <BackLink href="/evento/entrar">Voltar</BackLink>
          <span className="text-[0.62rem] font-black tracking-[0.15em] text-violet-300 uppercase">GTI CLICK</span>
        </header>

        <main className="flex flex-1 flex-col py-7">
          <section className="relative text-center">
            <div className="absolute top-1/2 left-1/2 -z-10 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-3xl" aria-hidden="true" />
            <div className="mx-auto grid size-20 place-items-center rounded-[1.7rem] border border-violet-300/20 bg-gradient-to-br from-violet-500/24 to-fuchsia-500/9 text-violet-100 shadow-[0_14px_45px_rgba(124,58,237,.2)]">
              <ShieldIcon className="size-9" />
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.055em] text-white sm:text-5xl">Antes do click 👀</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">Só um combinado rápido antes de entrar no álbum.</p>
          </section>

          <section className="mt-8 space-y-6 border-y border-white/7 py-7 text-sm leading-relaxed text-slate-300 sm:text-base">
            <div className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="text-xs font-black text-violet-300">01</span>
              <p>As fotos enviadas neste evento serão compartilhadas no álbum colaborativo e poderão ser visualizadas e baixadas pelos participantes autorizados.</p>
            </div>
            <div className="grid grid-cols-[2rem_1fr] gap-3">
              <span className="text-xs font-black text-fuchsia-300">02</span>
              <p>Autorizo a Galera do TI a utilizar as imagens que eu enviar ao GTI CLICK para produção e divulgação de conteúdos relacionados à comunidade, eventos e redes sociais, conforme os termos apresentados.</p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl bg-violet-500/[0.055] p-4 text-xs text-violet-100/75">
              <ShieldIcon className="mt-0.5 size-4 shrink-0 text-violet-300" />
              <p>Respeite as pessoas, o ambiente e as regras do evento.</p>
            </div>
          </section>

          <form action={acceptConsent} className="mt-6">
            <input type="hidden" name="eventSlug" value={event.slug} />
            <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-violet-300/18 bg-[#0a0813]/72 p-4 text-sm leading-relaxed text-slate-200 transition hover:border-violet-300/35">
              <input type="checkbox" name="consent" required className="peer sr-only" />
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border border-white/18 bg-black/25 text-transparent transition peer-checked:border-violet-400 peer-checked:bg-violet-600 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-300">
                <CheckIcon className="size-4" />
              </span>
              <span>Li e concordo com os termos de participação e uso de imagem.</span>
            </label>

            {error === "required" && (
              <p role="alert" className="mt-3 text-sm text-red-200/80">Marque o aceite para continuar.</p>
            )}
            {error === "save" && (
              <p role="alert" className="mt-3 text-sm text-red-200/80">Não foi possível registrar agora. Tente novamente.</p>
            )}

            <div className="mt-4 flex justify-center gap-5 text-xs font-bold text-violet-300">
              <Link href="/termos" target="_blank" rel="noreferrer" className="underline decoration-violet-400/30 underline-offset-4 hover:text-white">Termos de Uso</Link>
              <Link href="/privacidade" target="_blank" rel="noreferrer" className="underline decoration-violet-400/30 underline-offset-4 hover:text-white">Política de Privacidade</Link>
            </div>

            <button type="submit" className="gradient-button mt-6 w-full text-base">
              <CheckIcon className="size-5" />Entrar no álbum
            </button>
          </form>

          <div className="relative mt-5 flex min-h-14 items-center justify-center overflow-hidden">
            <div className="flex items-center gap-2 text-[0.68rem] text-slate-600">
              <LockIcon className="size-3.5 text-violet-300" />Seus dados estão seguros com a gente.
            </div>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
