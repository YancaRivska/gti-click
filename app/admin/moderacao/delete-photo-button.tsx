"use client";

import { deletePendingPhoto } from "./actions";

export function DeletePhotoButton({ photoId }: { photoId: string }) {
  return (
    <form
      action={deletePendingPhoto}
      onSubmit={(event) => {
        if (!window.confirm("Excluir esta foto permanentemente?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="photoId" value={photoId} />
      <button
        type="submit"
        className="min-h-10 rounded-xl border border-red-400/30 px-4 text-sm font-bold text-red-200 transition hover:bg-red-400/10"
      >
        EXCLUIR
      </button>
    </form>
  );
}
