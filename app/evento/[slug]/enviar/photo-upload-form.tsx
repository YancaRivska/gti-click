"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
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
      setStatus("error");
      setMessage("A foto foi enviada, mas não foi possível registrá-la.");
      return;
    }

    setFile(null);
    setPreviewUrl("");
    setCaption("");
    setInstagramHandle("");
    setStatus("success");
  }

  return (
    <main className="home-shell relative min-h-svh overflow-hidden px-5 py-10">
      <div className="lens" aria-hidden="true" />

      <section className="relative z-10 mx-auto w-full max-w-xl rounded-3xl border border-white/10 bg-[#0b0d1a]/95 p-6 shadow-2xl sm:p-9">
        <Link
          href={`/evento/${eventSlug}`}
          className="text-xs font-bold tracking-[0.18em] text-violet-300"
        >
          ← {eventName}
        </Link>

        <h1 className="mt-7 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Publique seu click
        </h1>
        <p className="mt-3 leading-relaxed text-slate-300">
          Tire uma foto agora ou escolha uma memória da sua galeria.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl bg-violet-600 px-4 text-center text-sm font-bold text-white transition hover:bg-violet-500">
            Tirar foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleFileChange}
              disabled={status === "loading"}
              className="sr-only"
            />
          </label>
          <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/15 px-4 text-center text-sm font-bold text-white transition hover:bg-white/5">
            Escolher da galeria
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={status === "loading"}
              className="sr-only"
            />
          </label>
        </div>

        {previewUrl && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <Image
              src={previewUrl}
              alt="Prévia da foto selecionada"
              width={900}
              height={900}
              unoptimized
              className="max-h-[28rem] w-full object-contain"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          <label htmlFor="caption" className="text-sm font-semibold text-slate-200">
            Conta pra galera...
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            maxLength={500}
            rows={3}
            disabled={status === "loading"}
            className="mt-3 w-full resize-none rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
          />

          <label htmlFor="instagram-handle" className="mt-5 block text-sm font-semibold text-slate-200">
            Seu @
          </label>
          <input
            id="instagram-handle"
            type="text"
            value={instagramHandle}
            onChange={(event) => setInstagramHandle(event.target.value)}
            placeholder="@seuinstagram"
            maxLength={50}
            autoComplete="off"
            disabled={status === "loading"}
            className="mt-3 min-h-12 w-full rounded-2xl border border-white/15 bg-white/5 px-4 text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15"
          />

          <button
            type="submit"
            disabled={!file || status === "loading"}
            className="mt-5 min-h-14 w-full rounded-2xl bg-violet-600 px-6 font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "loading" ? "Publicando..." : "Publicar no GTI CLICK"}
          </button>
        </form>

        {status === "success" && (
          <div role="status" className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-400/10 p-4 text-violet-100">
            <p className="font-bold">Foto enviada! 📸</p>
            <p className="mt-1 text-sm">
              Ela ficará disponível na galeria após aprovação da equipe GTI.
            </p>
          </div>
        )}

        {status === "error" && (
          <p role="alert" className="mt-5 text-sm text-red-300">
            {message}
          </p>
        )}

        <p className="mt-5 text-xs text-slate-500">
          JPEG, PNG ou WebP. Tamanho máximo: 10 MB.
        </p>
      </section>
    </main>
  );
}
