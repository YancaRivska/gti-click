import type { ReactNode } from "react";
import { AppShell, BackLink, GtiLogo, ShieldIcon } from "@/components/gti-ui";

export function LegalPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-4xl px-5 py-5 sm:px-8 sm:py-7">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <ShieldIcon className="size-5 text-violet-300" />
        </header>
        <article className="py-8 sm:py-12">
          <BackLink href="/">Voltar ao início</BackLink>
          <div className="glass-panel mt-7 rounded-[1.75rem] p-6 sm:p-10 lg:p-12">
            <span className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</span>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">{title}</h1>
            <div className="mt-8 space-y-5 border-t border-white/8 pt-8 leading-relaxed text-slate-300 [&_a]:font-bold [&_a]:text-violet-300 [&_a]:transition [&_a]:hover:text-white">
              {children}
            </div>
          </div>
        </article>
      </div>
    </AppShell>
  );
}
