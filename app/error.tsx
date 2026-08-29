"use client";

import Link from "next/link";
import { ApertureIcon, AppShell, GtiLogo } from "@/components/gti-ui";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-5 py-6 sm:px-8">
        <GtiLogo />
        <section role="alert" className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <span className="grid size-16 place-items-center rounded-full border border-red-300/10 bg-red-400/5 text-red-200"><ApertureIcon className="size-8" /></span>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">Ops, esse click não foi dessa vez.</h1>
          <p className="mt-4 max-w-md leading-relaxed text-slate-400">Tente novamente. Se o problema continuar, volte para o início e refaça o acesso ao evento.</p>
          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
            <button type="button" onClick={reset} className="gradient-button flex-1">Tentar novamente</button>
            <Link href="/" className="secondary-button flex-1">Voltar ao início</Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
