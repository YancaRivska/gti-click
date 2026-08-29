"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  AppShell,
  ArrowLeftIcon,
  CameraIcon,
  CheckIcon,
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

    const bytes = new Uint8Array(await selectedFile.slice(0, 12).arrayBuffer());

    if (!hasValidSignature(selectedFile.type, bytes)) {
      setStatus("error");
      setMessage("O arquivo selecionado não é uma imagem válida.");
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    event.target.value = "";
    void selectFile(selectedFile);
  }

  function clearSelectedPhoto() {
    setFile(null);
    setPreviewUrl("");
    setStatus("idle");
    setMessage("");
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
      <div className="mx-auto min-h-svh w-full max-w-xl px-4 pb-28 pt-5 sm:px-7 lg:pb-10">
        <header className="flex items-center justify-between">
          <Link href={`/evento/${eventSlug}`} aria-label="Voltar ao evento" className="icon-button rounded-full"><ArrowLeftIcon className="size-5" /></Link>
          <div className="text-right">
            <p className="text-sm font-black text-white">Enviar foto</p>
            <p className="mt-0.5 max-w-40 truncate text-[0.58rem] text-slate-600">{eventName}</p>
          </div>
        </header>

          <section className="pt-5">
          <div className="upload-heading">
            <h1 className="text-[2.25rem] leading-[0.95] font-black tracking-[-0.055em] text-white sm:text-5xl">Joga na galeria! 📸</h1>
            <p className="mt-2 text-sm text-slate-400">Mostra pra galera como foi!</p>
          </div>

          {previewUrl ? (
            <div className="relative mt-6 overflow-hidden rounded-[1.4rem] bg-black/35 shadow-[0_22px_60px_rgba(0,0,0,.35)]">
              <Image src={previewUrl} alt="Prévia da foto selecionada" width={1200} height={1200} unoptimized className="max-h-[32rem] min-h-72 w-full object-contain" />
              <button type="button" onClick={clearSelectedPhoto} aria-label="Remover foto selecionada" className="icon-button absolute top-3 right-3 rounded-full bg-black/65 text-lg">×</button>
              <span className="absolute bottom-3 left-3 rounded-full border border-emerald-300/15 bg-[#07130d]/80 px-3 py-1.5 text-[0.63rem] font-black text-emerald-200 backdrop-blur">Pronta para publicar</span>
            </div>
          ) : (
            <label className="upload-zone mt-6">
              <span className="upload-reference-icon"><UploadIcon className="size-11" /></span>
              <p className="mt-2 text-base font-black text-white">Toque para escolher uma foto</p>
              <p className="mt-1 text-xs text-slate-600">JPEG, PNG ou WebP · máximo 10 MB</p>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={status === "loading"} className="sr-only" />
            </label>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className="secondary-button min-h-20 flex-col gap-1.5 text-xs">
              <CameraIcon className="size-5 text-violet-300" />Tirar foto
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileChange} disabled={status === "loading"} className="sr-only" />
            </label>
            <label className="secondary-button min-h-20 flex-col gap-1.5 text-xs">
              <ImageIcon className="size-5 text-fuchsia-300" />Escolher da galeria
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} disabled={status === "loading"} className="sr-only" />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="upload-fields mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="caption" className="text-sm font-bold text-slate-200">Conta pra galera <span className="font-normal text-slate-600">(opcional)</span></label>
                <span className="text-[0.65rem] text-slate-600">{caption.length}/500</span>
              </div>
              <textarea id="caption" value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={500} rows={3} disabled={status === "loading"} placeholder="O que tornou esse momento especial?" className="field mt-2.5 resize-none px-4 py-3" />
            </div>

            <div>
              <label htmlFor="instagram-handle" className="text-sm font-bold text-slate-200">Seu @ <span className="font-normal text-slate-600">(opcional)</span></label>
              <input id="instagram-handle" type="text" value={instagramHandle} onChange={(event) => setInstagramHandle(event.target.value)} placeholder="@seuinstagram" maxLength={50} autoComplete="off" disabled={status === "loading"} className="field mt-2.5 min-h-14 px-4" />
            </div>

            <button type="submit" disabled={!file || status === "loading"} className="gradient-button w-full text-base">
              <UploadIcon className="size-5" />{status === "loading" ? "Publicando..." : "Publicar no GTI CLICK"}
            </button>
          </form>

          {status === "loading" && (
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/5" aria-label="Enviando foto">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400" />
            </div>
          )}

          {status === "success" && (
            <div role="status" className="mt-5 rounded-2xl border border-emerald-300/12 bg-gradient-to-br from-emerald-400/[0.07] to-violet-500/[0.06] p-4 text-emerald-100">
              <div className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-400/10"><CheckIcon className="size-5" /></span>
              <div><p className="font-black">Foto publicada! 💜</p><p className="mt-1 text-sm text-slate-400">Essa memória já está na galeria da galera.</p></div>
              </div>
              <Link href={`/evento/${eventSlug}/galeria`} className="secondary-button mt-4 w-full">Ver na galeria</Link>
            </div>
          )}

          {status === "error" && (
            <div role="alert" className="mt-5 flex items-center gap-3 rounded-2xl border border-red-300/10 bg-red-400/[0.045] p-3.5">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-red-300/10 bg-red-400/[0.06] text-red-200"><CameraIcon className="size-5" /></span>
              <div><p className="text-sm font-bold text-red-100/90">Ops, esse click não foi dessa vez.</p><p className="mt-1 text-xs leading-relaxed text-slate-500">{message}</p><button type="button" onClick={() => { setStatus("idle"); setMessage(""); }} className="mt-2 text-xs font-bold text-violet-300 hover:text-white">Tentar novamente</button></div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-2 text-[0.65rem] text-slate-600">
            <ShieldIcon className="size-3.5 text-violet-300" />Envio privado · publicação imediata
          </div>
        </section>

        <MobileEventNav eventSlug={eventSlug} active="upload" />
      </div>
    </AppShell>
  );
}
