"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
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
import {
  isHeicPhoto,
  isSupportedPhoto,
  MAX_PHOTOS_PER_BATCH,
  PHOTO_INPUT_ACCEPT,
  preparePhotoForUpload,
} from "@/lib/images/process-photo";
import { createClient } from "@/lib/supabase/browser";

const BUCKET = "event-photos";

type PhotoStatus = "ready" | "preparing" | "uploading" | "done" | "error";
type BatchStatus = "idle" | "uploading" | "complete";

type SelectedPhoto = {
  id: string;
  file: File;
  previewUrl: string | null;
  status: PhotoStatus;
  error?: string;
};

type BatchResult = {
  success: number;
  failed: number;
} | null;

const PHOTO_STATUS_LABELS: Record<PhotoStatus, string> = {
  ready: "Pronta para enviar",
  preparing: "Preparando",
  uploading: "Enviando",
  done: "Concluída",
  error: "Erro",
};

function normalizeIdentity(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");

  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("@")) {
    const handle = trimmed.replace(/^@+/, "").replace(/\s+/g, "");
    return handle ? `@${handle}` : null;
  }

  return trimmed;
}

function pluralizePhotos(count: number) {
  return count === 1 ? "foto" : "fotos";
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
  const router = useRouter();
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const photosRef = useRef<SelectedPhoto[]>([]);
  const [caption, setCaption] = useState("");
  const [identity, setIdentity] = useState("");
  const [batchStatus, setBatchStatus] = useState<BatchStatus>("idle");
  const [batchResult, setBatchResult] = useState<BatchResult>(null);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  function replacePhotos(updater: (current: SelectedPhoto[]) => SelectedPhoto[]) {
    const next = updater(photosRef.current);
    photosRef.current = next;
    setPhotos(next);
  }

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => {
        if (photo.previewUrl) {
          URL.revokeObjectURL(photo.previewUrl);
        }
      });
    };
  }, []);

  function updatePhoto(id: string, patch: Partial<SelectedPhoto>) {
    replacePhotos((current) =>
      current.map((photo) => (photo.id === id ? { ...photo, ...patch } : photo)),
    );
  }

  function resetFinishedBatch() {
    photosRef.current.forEach((photo) => {
      if (photo.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
    });
    photosRef.current = [];
    setPhotos([]);
    setBatchResult(null);
    setBatchStatus("idle");
    setProgress({ current: 0, total: 0 });
  }

  function selectFiles(fileList: FileList | null) {
    if (!fileList || batchStatus === "uploading") {
      return;
    }

    const selectedFiles = Array.from(fileList);
    setSelectionMessage("");

    if (!selectedFiles.length) {
      return;
    }

    const supportedFiles = selectedFiles.filter(isSupportedPhoto);

    if (supportedFiles.length !== selectedFiles.length) {
      setSelectionMessage("Selecione apenas fotos.");
    }

    if (!supportedFiles.length) {
      return;
    }

    const basePhotos = batchStatus === "complete" ? [] : photosRef.current;

    if (basePhotos.length + supportedFiles.length > MAX_PHOTOS_PER_BATCH) {
      setSelectionMessage("Você pode enviar até 10 fotos por vez.");
      return;
    }

    if (batchStatus === "complete") {
      resetFinishedBatch();
    }

    const nextPhotos = supportedFiles.map<SelectedPhoto>((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: isHeicPhoto(file) ? null : URL.createObjectURL(file),
      status: "ready",
    }));

    replacePhotos((current) => [...current, ...nextPhotos]);
    setBatchResult(null);
    setBatchStatus("idle");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFiles(event.target.files);
    event.target.value = "";
  }

  function removePhoto(id: string) {
    if (batchStatus === "uploading") {
      return;
    }

    const photo = photosRef.current.find((item) => item.id === id);
    if (photo?.previewUrl) {
      URL.revokeObjectURL(photo.previewUrl);
    }

    replacePhotos((current) => current.filter((item) => item.id !== id));
    setBatchResult(null);
    setBatchStatus("idle");
    setSelectionMessage("");
  }

  async function uploadBatch(photoIds?: string[]) {
    if (batchStatus === "uploading") {
      return;
    }

    const targetPhotos = photosRef.current.filter((photo) =>
      photoIds ? photoIds.includes(photo.id) : photo.status === "ready" || photo.status === "error",
    );

    if (!targetPhotos.length) {
      return;
    }

    const normalizedIdentity = normalizeIdentity(identity);
    if (normalizedIdentity && normalizedIdentity.length > 50) {
      setSelectionMessage("Seu nome ou @ deve ter no máximo 50 caracteres.");
      return;
    }

    setBatchStatus("uploading");
    setBatchResult(null);
    setSelectionMessage("");
    setProgress({ current: 1, total: targetPhotos.length });

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || user.id !== userId) {
      targetPhotos.forEach((photo) => {
        updatePhoto(photo.id, {
          status: "error",
          error: "Sua sessão expirou. Entre novamente para publicar.",
        });
      });
      setBatchStatus("complete");
      setBatchResult({ success: 0, failed: targetPhotos.length });
      return;
    }

    for (const [index, photo] of targetPhotos.entries()) {
      setProgress({ current: index + 1, total: targetPhotos.length });
      if (photo.previewUrl) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      updatePhoto(photo.id, { status: "preparing", error: undefined, previewUrl: null });

      let processedPhoto: Blob | null = null;
      let stage: "preparing" | "uploading" = "preparing";

      try {
        processedPhoto = await preparePhotoForUpload(photo.file);
        stage = "uploading";
        updatePhoto(photo.id, { status: "uploading" });

        const storagePath = `${eventSlug}/${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, processedPhoto, {
            cacheControl: "3600",
            contentType: "image/jpeg",
            upsert: false,
          });

        if (uploadError) {
          throw new Error("upload-failed");
        }

        const { error: recordError } = await supabase.from("photo_uploads").insert({
          user_id: user.id,
          event_id: eventId,
          storage_path: storagePath,
          caption: caption.trim() || null,
          instagram_handle: normalizedIdentity,
        });

        if (recordError) {
          await supabase.storage.from(BUCKET).remove([storagePath]);
          throw new Error("record-failed");
        }

        updatePhoto(photo.id, { status: "done", error: undefined });
      } catch {
        updatePhoto(photo.id, {
          status: "error",
          error:
            stage === "preparing"
              ? "Não conseguimos preparar uma das fotos."
              : "Não foi possível enviar esta foto.",
        });
      } finally {
        processedPhoto = null;
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
    }

    const finishedPhotos = photosRef.current;
    const success = finishedPhotos.filter((photo) => photo.status === "done").length;
    const failed = finishedPhotos.filter((photo) => photo.status === "error").length;

    setBatchResult({ success, failed });
    setBatchStatus("complete");

    if (success > 0) {
      router.refresh();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void uploadBatch();
  }

  const pendingPhotos = photos.filter(
    (photo) => photo.status === "ready" || photo.status === "error",
  );
  const failedPhotoIds = photos
    .filter((photo) => photo.status === "error")
    .map((photo) => photo.id);
  const isUploading = batchStatus === "uploading";
  const progressPercentage = progress.total
    ? Math.round((progress.current / progress.total) * 100)
    : 0;

  return (
    <AppShell>
      <div className="mx-auto min-h-svh w-full max-w-xl px-4 pb-28 pt-5 sm:px-7 lg:pb-10">
        <header className="flex items-center justify-between">
          <Link
            href={`/evento/${eventSlug}`}
            aria-label="Voltar ao evento"
            className="icon-button rounded-full"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>
          <div className="text-right">
            <p className="text-sm font-black text-white">Enviar fotos</p>
            <p className="mt-0.5 max-w-40 truncate text-[0.58rem] text-slate-600">{eventName}</p>
          </div>
        </header>

        <section className="pt-5">
          <div className="upload-heading">
            <h1 className="text-[2.25rem] leading-[0.95] font-black tracking-[-0.055em] text-white sm:text-5xl">
              Joga na galeria! 📸
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Escolhe as fotos. O GTI CLICK cuida do resto.
            </p>
          </div>

          {photos.length === 0 ? (
            <label className="upload-zone mt-6 cursor-pointer">
              <span className="upload-reference-icon">
                <UploadIcon className="size-11" />
              </span>
              <p className="mt-3 text-base font-black text-white">Selecionar fotos</p>
              <p className="mt-1.5 max-w-60 text-xs leading-relaxed text-slate-500">
                Até 10 por vez · fotos do iPhone também
              </p>
              <input
                type="file"
                accept={PHOTO_INPUT_ACCEPT}
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          ) : (
            <section className="mt-6" aria-labelledby="selected-photos-title">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p id="selected-photos-title" className="text-base font-black text-white">
                    {photos.length} {pluralizePhotos(photos.length)} selecionada{photos.length === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Uma de cada vez, sem pesar no celular.</p>
                </div>
                {!isUploading && photos.length < MAX_PHOTOS_PER_BATCH && (
                  <label className="batch-add-button">
                    <span>+ Adicionar</span>
                    <input
                      type="file"
                      accept={PHOTO_INPUT_ACCEPT}
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>

              <div className="batch-photo-grid mt-4">
                {photos.map((photo) => (
                  <article key={photo.id} className={`batch-photo-card is-${photo.status}`}>
                    <div className="batch-photo-preview">
                      {photo.previewUrl ? (
                        <Image
                          src={photo.previewUrl}
                          alt={`Prévia de ${photo.file.name}`}
                          fill
                          unoptimized
                          sizes="(max-width: 639px) 50vw, 16rem"
                          className="object-cover"
                        />
                      ) : (
                        <div className="batch-heic-placeholder">
                          <ImageIcon className="size-8" />
                          <span>{photo.status === "done" ? "Foto enviada" : "Foto selecionada"}</span>
                        </div>
                      )}

                      {!isUploading && photo.status !== "done" && (
                        <button
                          type="button"
                          onClick={() => removePhoto(photo.id)}
                          aria-label={`Remover ${photo.file.name}`}
                          className="batch-remove-button"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    <div className="batch-photo-status" aria-live="polite">
                      <span className="batch-status-dot" aria-hidden="true" />
                      <span className="truncate">{PHOTO_STATUS_LABELS[photo.status]}</span>
                    </div>
                    {photo.error && <p className="batch-photo-error">{photo.error}</p>}
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label className={`secondary-button min-h-20 flex-col gap-1.5 text-xs ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
              <CameraIcon className="size-5 text-violet-300" />
              Tirar foto
              <input
                type="file"
                accept={PHOTO_INPUT_ACCEPT}
                capture="environment"
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
            <label className={`secondary-button min-h-20 flex-col gap-1.5 text-xs ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"}`}>
              <ImageIcon className="size-5 text-fuchsia-300" />
              Escolher da galeria
              <input
                type="file"
                accept={PHOTO_INPUT_ACCEPT}
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
            </label>
          </div>

          {selectionMessage && (
            <p role="alert" className="mt-3 rounded-xl border border-amber-200/10 bg-amber-300/[0.045] px-3.5 py-3 text-xs text-amber-100/85">
              {selectionMessage}
            </p>
          )}

          <form onSubmit={handleSubmit} className="upload-fields mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="caption" className="text-sm font-bold text-slate-200">
                  Legenda <span className="font-normal text-slate-600">(opcional)</span>
                </label>
                <span className="text-[0.65rem] text-slate-600">{caption.length}/500</span>
              </div>
              <textarea
                id="caption"
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                maxLength={500}
                rows={3}
                disabled={isUploading}
                placeholder="Conta pra galera..."
                className="field mt-2.5 resize-none px-4 py-3"
              />
              <p className="mt-1.5 text-[0.65rem] text-slate-600">Aplicada a todas as fotos deste envio.</p>
            </div>

            <div>
              <label htmlFor="photo-identity" className="text-sm font-bold text-slate-200">
                Seu nome ou @ <span className="font-normal text-slate-600">(opcional)</span>
              </label>
              <input
                id="photo-identity"
                type="text"
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
                placeholder="Seu nome ou @seuinstagram"
                maxLength={50}
                autoComplete="off"
                disabled={isUploading}
                className="field mt-2.5 min-h-14 px-4"
              />
            </div>

            {pendingPhotos.length > 0 && batchStatus !== "complete" && (
              <button type="submit" disabled={isUploading} className="gradient-button w-full text-base">
                <UploadIcon className="size-5" />
                {isUploading
                  ? "Enviando fotos..."
                  : `Enviar ${pendingPhotos.length} ${pluralizePhotos(pendingPhotos.length)}`}
              </button>
            )}
          </form>

          {isUploading && (
            <div className="batch-progress mt-5" role="status" aria-live="polite">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black text-white">Enviando fotos...</p>
                <p className="text-xs font-bold text-violet-200">{progress.current} de {progress.total}</p>
              </div>
              <div className="batch-progress-track mt-3">
                <div className="batch-progress-value" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          )}

          {batchStatus === "complete" && batchResult && (
            <div role="status" className={`batch-result mt-5 ${batchResult.failed ? "has-errors" : "is-success"}`}>
              <span className="batch-result-icon">
                {batchResult.failed ? <CameraIcon className="size-5" /> : <CheckIcon className="size-5" />}
              </span>
              <div className="min-w-0 flex-1">
                {batchResult.success > 0 && (
                  <p className="font-black text-white">
                    {batchResult.success} {pluralizePhotos(batchResult.success)} enviada{batchResult.success === 1 ? "" : "s"} com sucesso.
                  </p>
                )}
                {batchResult.failed > 0 && (
                  <p className="mt-1 text-sm text-rose-100/80">
                    {batchResult.failed} não {batchResult.failed === 1 ? "pôde" : "puderam"} ser enviada{batchResult.failed === 1 ? "" : "s"}.
                  </p>
                )}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  {failedPhotoIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => void uploadBatch(failedPhotoIds)}
                      className="secondary-button flex-1"
                    >
                      Tentar novamente ({failedPhotoIds.length})
                    </button>
                  )}
                  {batchResult.success > 0 && (
                    <Link href={`/evento/${eventSlug}/galeria`} className="secondary-button flex-1">
                      Ver na galeria
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-center gap-2 text-[0.65rem] text-slate-600">
            <ShieldIcon className="size-3.5 text-violet-300" />
            Fotos privadas · publicação imediata
          </div>
        </section>

        <MobileEventNav eventSlug={eventSlug} active="upload" />
      </div>
    </AppShell>
  );
}
