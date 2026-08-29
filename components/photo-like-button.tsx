"use client";

import { useEffect, useState, useTransition } from "react";
import { HeartIcon } from "@/components/gti-ui";
import { togglePhotoLike } from "@/app/evento/[slug]/galeria/like-actions";

export function PhotoLikeButton({
  eventSlug,
  photoId,
  initialLiked,
  initialCount,
  variant = "detail",
  enabled = true,
}: {
  eventSlug: string;
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  variant?: "card" | "detail";
  enabled?: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setMessage(""), 2600);
    return () => window.clearTimeout(timer);
  }, [message]);

  function handleLike() {
    if (pending || !enabled) {
      return;
    }

    const previousLiked = liked;
    const previousCount = count;
    const optimisticLiked = !previousLiked;

    setLiked(optimisticLiked);
    setCount(Math.max(0, previousCount + (optimisticLiked ? 1 : -1)));
    setMessage("");

    startTransition(async () => {
      const result = await togglePhotoLike(eventSlug, photoId);

      if (!result.ok) {
        setLiked(previousLiked);
        setCount(previousCount);
        setMessage(result.message);
        return;
      }

      setLiked(result.liked);
      setCount(result.count);
      setMessage(result.liked ? "Foto curtida." : "Curtida removida.");
    });
  }

  const label = liked ? "Remover curtida" : "Curtir foto";

  return (
    <div className={variant === "card" ? "gallery-like-wrapper" : "contents"}>
      <button
        type="button"
        onClick={handleLike}
        disabled={pending || !enabled}
        aria-pressed={liked}
        aria-label={`${label}. ${count} ${count === 1 ? "curtida" : "curtidas"}`}
        title={enabled ? label : "Curtidas disponíveis após a atualização do álbum"}
        className={
          variant === "card"
            ? `gallery-like-pill ${liked ? "is-liked" : ""}`
            : `media-action media-action-like ${liked ? "is-liked" : ""}`
        }
      >
        <HeartIcon
          filled={liked}
          className={variant === "card" ? "size-3.5" : "size-5"}
        />
        {variant === "detail" ? (
          <span>{liked ? "Curtiu" : "Curtir"}{count > 0 ? ` · ${count}` : ""}</span>
        ) : (
          <strong>{count}</strong>
        )}
      </button>
      {message && (
        <span className="like-feedback" role="status" aria-live="polite">
          {message}
        </span>
      )}
    </div>
  );
}
