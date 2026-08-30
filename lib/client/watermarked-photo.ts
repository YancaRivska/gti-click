export type WatermarkedPhotoFile = {
  blob: Blob;
  file: File;
  fileName: string;
};

function getDownloadName(response: Response, fallback: string) {
  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
}

export async function fetchWatermarkedPhoto(
  eventSlug: string,
  photoId: string,
): Promise<WatermarkedPhotoFile> {
  const response = await fetch(
    `/api/evento/${encodeURIComponent(eventSlug)}/fotos/${encodeURIComponent(photoId)}/download`,
    { method: "GET", credentials: "same-origin", cache: "no-store" },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error || "Não foi possível preparar esta foto.");
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("O arquivo gerado não é uma foto válida.");
  }

  const fileName = getDownloadName(
    response,
    `gti-click-${eventSlug}-${photoId}.jpg`,
  );

  return {
    blob,
    fileName,
    file: new File([blob], fileName, {
      type: blob.type,
      lastModified: Date.now(),
    }),
  };
}

export function canSharePhotoFile(file: File) {
  return Boolean(
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] }),
  );
}

export function isAppleMobileDevice() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function triggerPhotoDownload(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}
