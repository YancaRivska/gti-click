"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HeartIcon } from "@/components/gti-ui";
import { createClient } from "@/lib/supabase/browser";

export function PhotoLikeButton({
  photoId,
  initialLiked,
  initialCount,
  variant = "detail",
  enabled = true,
}: {
  photoId: string;
  initialLiked: boolean;
  initialCount: number;
  variant?: "card" | "detail";
  enabled?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
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
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setLiked(previousLiked);
        setCount(previousCount);
        setMessage("Entre novamente no evento para curtir.");
        return;
      }

      const mutation = optimisticLiked
        ? await supabase.from("photo_likes").insert({
            photo_id: photoId,
            user_id: user.id,
          })
        : await supabase
            .from("photo_likes")
            .delete()
            .eq("photo_id", photoId)
            .eq("user_id", user.id);

      // Uma curtida já existente representa o mesmo estado visual desejado.
      if (mutation.error && !(optimisticLiked && mutation.error.code === "23505")) {
        setLiked(previousLiked);
        setCount(previousCount);
        setMessage(getLikeErrorMessage(mutation.error.code));
        return;
      }

      const { count: persistedCount } = await supabase
        .from("photo_likes")
        .select("photo_id", { count: "exact", head: true })
        .eq("photo_id", photoId);

      setLiked(optimisticLiked);
      setCount(persistedCount ?? Math.max(0, previousCount + (optimisticLiked ? 1 : -1)));
      setMessage(optimisticLiked ? "Foto curtida." : "Curtida removida.");
      router.refresh();
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

function getLikeErrorMessage(code?: string) {
  if (code === "42P01" || code === "PGRST205") {
    return "As curtidas ainda não foram ativadas neste álbum.";
  }

  if (code === "42501") {
    return "Não foi possível salvar a curtida neste álbum.";
  }

  return "Não foi possível atualizar a curtida.";
}
