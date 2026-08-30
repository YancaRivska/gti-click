"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ShareIcon } from "@/components/gti-ui";
import {
  canSharePhotoFile,
  fetchWatermarkedPhoto,
  triggerPhotoDownload,
} from "@/lib/client/watermarked-photo";

type ShareStatus = "idle" | "loading" | "success" | "error";

export function SharePhotoButton({
  eventSlug,
  photoId,
}: {
  eventSlug: string;
  photoId: string;
}) {
  const [status, setStatus] = useState<ShareStatus>("idle");
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

  async function share() {
    if (status === "loading") {
      return;
    }

    setStatus("loading");
    setMessage("Preparando a foto para compartilhar...");

    try {
      const photo = await fetchWatermarkedPhoto(eventSlug, photoId);

      if (canSharePhotoFile(photo.file)) {
        await navigator.share({
          files: [photo.file],
          title: "GTI CLICK",
        });
        setStatus("success");
        setMessage("Foto compartilhada!");
      } else {
        triggerPhotoDownload(photo.blob, photo.fileName);
        setStatus("success");
        setMessage("Seu navegador não compartilha arquivos. A foto foi baixada para você enviar.");
      }

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
          : "Não foi possível compartilhar esta foto.",
      );
      scheduleReset();
    }
  }

  return (
    <div className="watermarked-download is-detail">
      <button
        type="button"
        onClick={() => void share()}
        disabled={status === "loading"}
        className="media-action media-action-secondary"
        aria-busy={status === "loading"}
        aria-label="Compartilhar o arquivo da foto"
      >
        {status === "loading" ? (
          <span className="download-spinner size-5" aria-hidden="true" />
        ) : status === "success" ? (
          <CheckIcon className="size-5" />
        ) : (
          <ShareIcon className="size-5" />
        )}
        {status === "loading" ? "Preparando..." : "Compartilhar"}
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
