"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, DownloadIcon } from "@/components/gti-ui";

type DownloadStatus = "idle" | "loading" | "success" | "error";

function getDownloadName(response: Response, fallback: string) {
  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
}

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
  const objectUrlRef = useRef<string | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
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
      const response = await fetch(
        `/api/evento/${encodeURIComponent(eventSlug)}/fotos/${encodeURIComponent(photoId)}/download`,
        { method: "GET", credentials: "same-origin", cache: "no-store" },
      );

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || "Não foi possível baixar esta foto.");
      }

      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) {
        throw new Error("O arquivo gerado não é uma foto válida.");
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const objectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = objectUrl;
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = getDownloadName(
        response,
        `gti-click-${eventSlug}-${photoId}.jpg`,
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => {
        if (objectUrlRef.current === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrlRef.current = null;
        }
      }, 1500);

      setStatus("success");
      setMessage("Foto com marca d’água pronta!");
      scheduleReset();
    } catch (error) {
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
