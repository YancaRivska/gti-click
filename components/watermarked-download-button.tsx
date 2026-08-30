"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, DownloadIcon } from "@/components/gti-ui";
import {
  canSharePhotoFile,
  fetchWatermarkedPhoto,
  isAppleMobileDevice,
  triggerPhotoDownload,
} from "@/lib/client/watermarked-photo";

type DownloadStatus = "idle" | "loading" | "success" | "error";

export function WatermarkedDownloadButton({
  eventSlug,
  photoId,
  variant = "detail",
}: {
  eventSlug: string;
  photoId: string;
  variant?: "card" | "detail";
}) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [message, setMessage] = useState("");
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  function scheduleReset() {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 3200);
  }

  async function download() {
    if (status === "loading") {
      return;
    }

    setStatus("loading");
    setMessage("Preparando sua foto com a marca d’água...");

    try {
      const photo = await fetchWatermarkedPhoto(eventSlug, photoId);

      if (isAppleMobileDevice() && canSharePhotoFile(photo.file)) {
        setMessage("No menu do iPhone, toque em “Salvar Imagem”.");
        await navigator.share({
          files: [photo.file],
          title: "GTI CLICK",
        });
      } else {
        triggerPhotoDownload(photo.blob, photo.fileName);
      }

      setStatus("success");
      setMessage(
        isAppleMobileDevice()
          ? "Use “Salvar Imagem” para guardar no aplicativo Fotos."
          : "Foto com marca d’água pronta!",
      );
      scheduleReset();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setStatus("idle");
        setMessage("");
        return;
      }

      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Não conseguimos gerar o download. Tente novamente.",
      );
      scheduleReset();
    }
  }

  const isCard = variant === "card";
  const label = status === "loading"
    ? "Gerando..."
    : status === "success"
      ? "Pronta!"
      : status === "error"
        ? "Tentar"
        : "Baixar";

  return (
    <div className={isCard ? "watermarked-download is-card" : "watermarked-download is-detail"}>
      <button
        type="button"
        onClick={() => void download()}
        disabled={status === "loading"}
        className={isCard
          ? "gallery-card-action is-download is-watermarked"
          : "media-action media-action-primary is-watermarked"}
        aria-label="Baixar foto com marca d'água"
        aria-busy={status === "loading"}
      >
        {status === "loading" ? (
          <span className={isCard ? "download-spinner size-3.5" : "download-spinner size-5"} aria-hidden="true" />
        ) : status === "success" ? (
          <CheckIcon className={isCard ? "size-3.5" : "size-5"} />
        ) : (
          <DownloadIcon className={isCard ? "size-3.5" : "size-5"} />
        )}
        <span>{label}</span>
      </button>

      {message && (
        <span
          role={status === "error" ? "alert" : "status"}
          className={`download-toast is-${status}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
