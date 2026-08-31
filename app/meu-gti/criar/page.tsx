import { redirect } from "next/navigation";
import {
  AppShell,
  BackLink,
  GtiLogo,
  ShieldIcon,
} from "@/components/gti-ui";
import { createClient } from "@/lib/supabase/server";
import { CreateProfileForm } from "./profile-form";

export default async function CreateProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/evento/entrar");
  }

  if (!user.is_anonymous && user.email) {
    redirect("/meu-gti");
  }

  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-10 pt-5 sm:px-7">
        <header className="flex items-center justify-between">
          <BackLink href="/meu-gti">Voltar</BackLink>
          <GtiLogo size="compact" />
        </header>

        <main className="flex flex-1 flex-col justify-center py-8">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-violet-200 shadow-[0_14px_45px_rgba(124,58,237,.16)]">
            <ShieldIcon className="size-7" />
          </div>
          <div className="mt-5 text-center">
            <p className="event-section-label justify-center"><span className="eyebrow-dot" />Perfil opcional</p>
            <h1 className="mt-3 text-[2.2rem] leading-none font-black tracking-[-0.055em] text-white">
              Guarde sua jornada GTI
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              Transforme seu acesso atual em uma conta e leve suas fotos, curtidas e eventos com você.
            </p>
          </div>

          <CreateProfileForm userId={user.id} />
        </main>
      </div>
    </AppShell>
  );
}
