import { redirect } from "next/navigation";
import {
  AppShell,
  BackLink,
  GtiLogo,
  LockIcon,
} from "@/components/gti-ui";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user.is_anonymous && user.email) {
    redirect("/meu-gti");
  }

  const confirmationError = (await searchParams).error === "confirm";

  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-10 pt-5 sm:px-7">
        <header className="flex items-center justify-between">
          <BackLink href="/">Início</BackLink>
          <GtiLogo size="compact" />
        </header>

        <main className="flex flex-1 flex-col justify-center py-8">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-violet-200">
            <LockIcon className="size-7" />
          </span>
          <div className="mt-5 text-center">
            <p className="event-section-label justify-center"><span className="eyebrow-dot" />Minha jornada GTI</p>
            <h1 className="mt-3 text-[2.25rem] leading-none font-black tracking-[-0.055em] text-white">Entre no seu perfil</h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">Seus eventos, fotos e memórias com a galera em um só lugar.</p>
          </div>

          {confirmationError && (
            <p role="alert" className="feedback-error mt-5">O link não pôde ser confirmado. Solicite um novo acesso.</p>
          )}

          <LoginForm canCreateProfile={Boolean(user?.is_anonymous)} />
        </main>
      </div>
    </AppShell>
  );
}
