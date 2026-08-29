"use client";

import { useFormStatus } from "react-dom";
import { TrashIcon } from "@/components/gti-ui";
import { deleteOwnPhoto } from "./actions";

function DeleteButton({ variant }: { variant: "detail" | "card" }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={variant === "card" ? "gallery-card-action is-danger" : "media-action media-action-danger"}
      aria-label={variant === "card" ? "Excluir minha foto" : undefined}
    >
      <TrashIcon className={variant === "card" ? "size-3.5" : "size-5"} />
      <span>{pending ? "Excluindo..." : variant === "card" ? "Excluir" : "Excluir foto"}</span>
    </button>
  );
}

export function DeleteOwnPhotoButton({
  eventSlug,
  photoId,
  variant = "detail",
}: {
  eventSlug: string;
  photoId: string;
  variant?: "detail" | "card";
}) {
  return (
    <form
      action={deleteOwnPhoto}
      className={variant === "card" ? "min-w-0 flex-1" : "min-w-0"}
      onSubmit={(event) => {
        if (!window.confirm("Excluir esta foto permanentemente? Essa ação não poderá ser desfeita.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <input type="hidden" name="photoId" value={photoId} />
      <DeleteButton variant={variant} />
    </form>
  );
}
