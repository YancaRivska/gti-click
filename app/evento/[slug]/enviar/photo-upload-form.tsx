"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  AppShell,
  BackLink,
  CameraIcon,
  CheckIcon,
  GtiLogo,
  ImageIcon,
  MobileEventNav,
  ShieldIcon,
  UploadIcon,
} from "@/components/gti-ui";
import { createClient } from "@/lib/supabase/browser";

const BUCKET = "event-photos";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Status = "idle" | "loading" | "success" | "error";

function hasValidSignature(type: string, bytes: Uint8Array) {
  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }

  return (
    type === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

export function PhotoUploadForm({
  eventId,
  eventName,
  eventSlug,
  userId,
}: {
  eventId: string;
  eventName: string;
  eventSlug: string;
  userId: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  async function selectFile(selectedFile?: File) {
    setStatus("idle");
    setMessage("");

    if (!selectedFile) {
      return;
    }

    if (!EXTENSIONS[selectedFile.type]) {
      setStatus("error");
      setMessage("Use uma imagem JPEG, PNG ou WebP.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setStatus("error");
      setMessage("A imagem deve ter no máximo 10 MB.");
      return;
    }

    const bytes = new Uint8Array(
      await selectedFile.slice(0, 12).arrayBuffer(),
    );

    if (!hasValidSignature(selectedFile.type, bytes)) {
      setStatus("error");
      setMessage("O arquivo selecionado não é uma imagem válida.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(nextPreviewUrl);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    void selectFile(selectedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file || status === "loading") {
      return;
    }

    setStatus("loading");
    setMessage("");

    const handleWithoutAt = instagramHandle
      .trim()
      .replace(/\s+/g, "")
      .replace(/^@+/, "");
    const normalizedHandle = handleWithoutAt ? `@${handleWithoutAt}` : null;

    if (normalizedHandle && normalizedHandle.length > 50) {
      setStatus("error");
      setMessage("O @ deve ter no máximo 50 caracteres.");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.id !== userId) {
      setStatus("error");
      setMessage("Sua sessão expirou. Entre novamente para publicar.");
      return;
    }

    const extension = EXTENSIONS[file.type];
    const storagePath = `${eventSlug}/${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setStatus("error");
      setMessage("Não foi possível enviar a foto. Tente novamente.");
      return;
    }

    const { error: recordError } = await supabase.from("photo_uploads").insert({
      user_id: user.id,
      event_id: eventId,
      storage_path: storagePath,
      caption: caption.trim() || null,
      instagram_handle: normalizedHandle,
    });

    if (recordError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);
      setStatus("error");
      setMessage("Ops, esse click não foi dessa vez. Tente novamente.");
      return;
    }

    setFile(null);
    setPreviewUrl("");
    setCaption("");
    setInstagramHandle("");
    setStatus("success");
  }

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-6xl px-5 py-5 pb-24 sm:px-8 sm:py-7 lg:pb-0">
        <header className="flex items-center justify-between border-b border-white/8 pb-5">
          <GtiLogo />
          <span className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <ShieldIcon className="size-4 text-violet-300" />
            Envio privado e moderado
          </span>
        </header>

        <div className="py-8 sm:py-12">
          <BackLink href={`/evento/${eventSlug}`}>{eventName}</BackLink>

          <section className="mt-7 grid gap-8 lg:grid-cols-[.72fr_1.28fr] lg:gap-12">
            <div className="lg:pt-5">
              <span className="eyebrow">
                <span className="eyebrow-dot" />
                Faça parte do álbum
              </span>
              <h1 className="mt-6 text-4xl leading-[0.95] font-black tracking-[-0.05em] text-white sm:text-6xl">
                Joga na
                <span className="text-gradient block">galeria! 📸</span>
              </h1>
              <p className="mt-5 max-w-md leading-relaxed text-slate-400">
                Mostra pra galera como foi! Tire uma foto agora ou escolha uma memória da galeria.
              </p>

              <div className="mt-8 space-y-3">
                <UploadTip number="01" text="Escolha ou tire a foto" />
                <UploadTip number="02" text="Conte a história e adicione seu @" />
                <UploadTip number="03" text="Envie para a moderação GTI" />
              </div>
              <div className="relative mt-7 hidden h-72 overflow-hidden rounded-3xl border border-violet-300/10 bg-violet-500/[0.035] lg:block">
                <Image src="/assets/gti-click/mascot-camera.jpg" alt="Mascote GTI CLICK fotografando" fill sizes="20rem" className="object-contain object-bottom mix-blend-screen" />
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] p-5 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black tracking-[0.14em] text-violet-300 uppercase">Nova publicação</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white">Escolha uma foto</h2>
                </div>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-400/10 text-violet-200">
                  <CameraIcon className="size-5" />
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <label className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-violet-300/20 bg-violet-500/[0.08] px-3 text-center text-sm font-bold text-white transition hover:border-violet-300/40 hover:bg-violet-500/12">
                  <span className="grid size-10 place-items-center rounded-xl bg-violet-500 text-white shadow-[0_10px_28px_rgba(124,58,237,.25)]">
                    <CameraIcon className="size-5" />
                  </span>
                  Tirar foto
                  <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileChange} disabled={status === "loading"} className="sr-only" />
                </label>
                <label className="group flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-3 text-center text-sm font-bold text-white transition hover:border-violet-300/30 hover:bg-white/5">
                  <span className="grid size-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-violet-200">
                    <ImageIcon className="size-5" />
                  </span>
                  Escolher da galeria
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={status === "loading"} className="sr-only" />
                </label>
              </div>

              {previewUrl ? (
                <div className="relative mt-5 overflow-hidden rounded-2xl border border-violet-300/15 bg-black/30">
                  <Image src={previewUrl} alt="Prévia da foto selecionada" width={900} height={900} unoptimized className="max-h-[30rem] w-full object-contain" />
                  <span className="absolute top-3 left-3 rounded-full border border-emerald-300/20 bg-[#07130d]/90 px-3 py-1.5 text-[0.65rem] font-black text-emerald-200 backdrop-blur">
                    Foto selecionada
                  </span>
                </div>
              ) : (
                <div className="mt-5 flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 text-center">
                  <div className="relative h-24 w-24">
                    <Image src="/assets/gti-click/upload-cloud.jpg" alt="Nuvem de upload com fotos" fill sizes="6rem" className="object-contain mix-blend-screen" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-400">Sua prévia aparece aqui</p>
                  <p className="mt-1 text-xs text-slate-600">JPEG, PNG ou WebP · até 10 MB</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6">
                <label htmlFor="caption" className="text-sm font-bold text-slate-200">Conta pra galera <span className="font-normal text-slate-600">(opcional)</span></label>
                <textarea id="caption" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={500} rows={3} disabled={status === "loading"} placeholder="O que tornou esse momento especial?" className="field mt-3 resize-none px-4 py-3" />

                <label htmlFor="instagram-handle" className="mt-5 block text-sm font-bold text-slate-200">Seu @ <span className="font-normal text-slate-600">(opcional)</span></label>
                <input id="instagram-handle" type="text" value={instagramHandle} onChange={(event) => setInstagramHandle(event.target.value)} placeholder="@seuinstagram" maxLength={50} autoComplete="off" disabled={status === "loading"} className="field mt-3 min-h-13 px-4" />
                <p className="mt-2 text-xs text-slate-600">Aparece junto desta foto. Você pode informar com ou sem @.</p>

                <button type="submit" disabled={!file || status === "loading"} className="gradient-button mt-6 w-full">
                  <UploadIcon className="size-5" />
                  {status === "loading" ? "Publicando..." : "Publicar no GTI CLICK"}
                </button>
              </form>

              {status === "loading" && (
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />
                </div>
              )}

              {status === "success" && (
                <div role="status" className="mt-5 flex gap-3 rounded-2xl border border-emerald-300/15 bg-emerald-400/[0.07] p-4 text-emerald-100">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-400/12"><CheckIcon className="size-5" /></span>
                  <div><p className="font-bold">Foto enviada! 💜</p><p className="mt-1 text-sm text-emerald-100/70">Sua foto será analisada e ficará disponível após aprovação.</p></div>
                </div>
              )}

              {status === "error" && (
                <div role="alert" className="mt-5 flex items-center gap-3 rounded-xl border border-red-400/15 bg-red-400/8 px-3 py-3 text-sm text-red-200">
                  <div className="relative size-14 shrink-0"><Image src="/assets/gti-click/error-camera.jpg" alt="Câmera com alerta" fill sizes="3.5rem" className="object-contain mix-blend-screen" /></div>
                  <p>{message}</p>
                </div>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-white/8 pt-5 text-xs leading-relaxed text-slate-600">
                <ShieldIcon className="size-4 shrink-0 text-violet-300" />
                O arquivo permanece no bucket privado do evento.
              </div>
            </div>
          </section>
        </div>
        <MobileEventNav eventSlug={eventSlug} active="upload" />
      </div>
    </AppShell>
  );
}

function UploadTip({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-violet-300/15 bg-violet-400/[0.07] text-xs font-black text-violet-200">{number}</span>
      {text}
    </div>
  );
}
