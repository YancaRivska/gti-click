"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { TrashIcon } from "@/components/gti-ui";
import { deleteOwnPhoto } from "./actions";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="confirm-delete-button">
      <TrashIcon className="size-4" />
      {pending ? "Excluindo..." : "Excluir foto"}
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
  const [isOpen, setIsOpen] = useState(false);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={variant === "card" ? "gallery-card-action is-danger" : "media-action media-action-danger"}
        aria-label="Excluir minha foto"
      >
        <TrashIcon className={variant === "card" ? "size-3.5" : "size-5"} />
        <span>Excluir</span>
      </button>

      {isOpen && (
        <div className="confirm-overlay" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${photoId}`}
            className="confirm-dialog"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span className="confirm-dialog-icon"><TrashIcon className="size-6" /></span>
            <h2 id={`delete-title-${photoId}`} className="mt-4 text-xl font-black text-white">Excluir esta foto?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">Essa ação não poderá ser desfeita.</p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button ref={cancelButtonRef} type="button" onClick={() => setIsOpen(false)} className="confirm-cancel-button">Cancelar</button>
              <form action={deleteOwnPhoto}>
                <input type="hidden" name="eventSlug" value={eventSlug} />
                <input type="hidden" name="photoId" value={photoId} />
                <ConfirmDeleteButton />
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
