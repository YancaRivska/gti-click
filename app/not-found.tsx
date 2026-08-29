import Image from "next/image";
import Link from "next/link";
import { AppShell, ArrowLeftIcon, GtiLogo } from "@/components/gti-ui";

export default function NotFound() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-5 py-6 sm:px-8">
        <GtiLogo />
        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="relative h-52 w-52 sm:h-64 sm:w-64">
            <Image
              src="/assets/gti-click/error-camera.jpg"
              alt="Câmera GTI CLICK com alerta"
              fill
              sizes="16rem"
              className="object-contain mix-blend-screen"
            />
          </div>
          <p className="eyebrow mt-2"><span className="eyebrow-dot" />Erro 404</p>
          <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
            Esse click não existe por aqui.
          </h1>
          <p className="mt-4 max-w-md leading-relaxed text-slate-400">
            O endereço pode ter mudado ou essa memória não está mais disponível.
          </p>
          <Link href="/" className="gradient-button mt-8">
            <ArrowLeftIcon className="size-5" />
            Voltar para o início
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
