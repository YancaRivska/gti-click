import { redirect } from "next/navigation";
import { AppShell, BackLink, GtiLogo, LockIcon } from "@/components/gti-ui";
import { createClient } from "@/lib/supabase/server";
import { SetPasswordForm } from "../_components/set-password-form";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/meu-gti/entrar");
  }

  return (
    <PasswordShell title="Agora crie sua senha" description="Seu e-mail foi confirmado. Falta só proteger sua jornada GTI.">
      <SetPasswordForm />
    </PasswordShell>
  );
}

export function PasswordShell({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-5 pb-10 pt-5 sm:px-7">
        <header className="flex items-center justify-between"><BackLink href="/meu-gti/entrar">Voltar</BackLink><GtiLogo size="compact" /></header>
        <main className="flex flex-1 flex-col justify-center py-8">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-violet-300/20 bg-violet-500/10 text-violet-200"><LockIcon className="size-7" /></span>
          <div className="mt-5 text-center"><h1 className="text-[2.15rem] leading-none font-black tracking-[-0.055em] text-white">{title}</h1><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-400">{description}</p></div>
          {children}
        </main>
      </div>
    </AppShell>
  );
}
