"use client";

import { TrashIcon } from "@/components/gti-ui";
import { deleteOwnPhoto } from "./actions";

export function DeleteOwnPhotoButton({
  eventSlug,
  photoId,
}: {
  eventSlug: string;
  photoId: string;
}) {
  return (
    <form
      action={deleteOwnPhoto}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Excluir sua foto permanentemente? Essa ação não poderá ser desfeita.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <input type="hidden" name="photoId" value={photoId} />
      <button
        type="submit"
        className="secondary-button w-full border-red-300/15 text-red-200/80 hover:border-red-300/25 hover:bg-red-400/[0.07]"
      >
        <TrashIcon className="size-4" />
        Excluir minha foto
      </button>
    </form>
  );
}
