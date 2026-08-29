"use client";

import { useState } from "react";
import { ShareIcon } from "@/components/gti-ui";

export function SharePhotoButton() {
  const [copied, setCopied] = useState(false);

  async function share() {
    const shareData = {
      title: "GTI CLICK",
      text: "Olha esse click do evento!",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={share} className="media-action media-action-secondary">
      <ShareIcon className="size-5" />
      {copied ? "Link copiado" : "Compartilhar"}
    </button>
  );
}
