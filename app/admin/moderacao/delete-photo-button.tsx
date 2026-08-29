"use client";

import { deletePendingPhoto } from "./actions";
import { TrashIcon } from "@/components/gti-ui";

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
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-300/15 bg-red-400/[0.07] px-4 text-sm font-black text-red-200 transition hover:bg-red-400/12"
      >
        <TrashIcon className="size-4" />
        Excluir
      </button>
    </form>
  );
}
