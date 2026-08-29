import { Buffer } from "node:buffer";
import { getEventBySlug } from "@/data/events";
import { hasEventConsent } from "@/lib/consent";
import { createWatermarkedDownload } from "@/lib/images/watermark-download";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "event-photos";
const PHOTO_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUPPORTED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

function errorResponse(message: string, status: number) {
  return Response.json(
    { error: message },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; photoId: string }> },
) {
  const { slug, photoId } = await params;
  const event = getEventBySlug(slug);

  if (!event || !PHOTO_ID_PATTERN.test(photoId)) {
    return errorResponse("Foto não encontrada.", 404);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return errorResponse("Entre novamente para baixar esta foto.", 401);
  }

  if (!(await hasEventConsent(supabase, user.id, event.id))) {
    return errorResponse("Aceite os termos do evento antes de baixar.", 403);
  }

  let { data: photo, error: photoError } = await supabase
    .from("photo_uploads")
    .select("id, storage_path")
    .eq("id", photoId)
    .eq("event_id", event.id)
    .neq("moderation_status", "rejected")
    .maybeSingle();

  if (photoError) {
    const fallback = await supabase
      .from("photo_uploads")
      .select("id, storage_path")
      .eq("id", photoId)
      .eq("event_id", event.id)
      .maybeSingle();

    photo = fallback.data;
    photoError = fallback.error;
  }

  if (
    photoError ||
    !photo ||
    !photo.storage_path.startsWith(`${event.slug}/`)
  ) {
    return errorResponse("Foto não encontrada.", 404);
  }

  const sourceExtension = photo.storage_path.split(".").pop()?.toLowerCase();
  if (!sourceExtension || !SUPPORTED_EXTENSIONS.has(sourceExtension)) {
    return errorResponse("Este formato de foto não pode ser baixado.", 415);
  }

  const { data: originalPhoto, error: storageError } = await supabase.storage
    .from(BUCKET)
    .download(photo.storage_path);

  if (storageError || !originalPhoto) {
    return errorResponse("Não foi possível preparar esta foto agora.", 502);
  }

  try {
    const watermarked = await createWatermarkedDownload(
      Buffer.from(await originalPhoto.arrayBuffer()),
    );
    const fileName = `gti-click-${event.slug}-${photo.id}.${watermarked.extension}`;

    return new Response(new Uint8Array(watermarked.data), {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(watermarked.data.byteLength),
        "Content-Type": watermarked.contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("GTI CLICK watermark generation failed", {
      photoId,
      reason: error instanceof Error ? error.message : "unknown",
    });
    return errorResponse("Não conseguimos gerar a foto com a marca d’água.", 500);
  }
}
