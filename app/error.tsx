"use client";

import Image from "next/image";
import Link from "next/link";
import { AppShell, GtiLogo } from "@/components/gti-ui";

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
          <div className="relative h-44 w-44 sm:h-56 sm:w-56">
            <Image src="/assets/gti-click/error-camera.jpg" alt="Câmera GTI CLICK com alerta" fill sizes="14rem" className="object-contain mix-blend-screen" />
          </div>
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
