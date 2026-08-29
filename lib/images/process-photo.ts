"use client";

export const MAX_PHOTOS_PER_BATCH = 10;
export const MAX_IMAGE_EDGE = 2048;
export const JPEG_QUALITY = 0.85;
export const PHOTO_INPUT_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const SUPPORTED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "webp",
  "heic",
  "heif",
]);

const VIDEO_EXTENSIONS = new Set(["mov", "mp4", "m4v", "webm"]);

function extensionOf(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function isHeicPhoto(file: File) {
  const extension = extensionOf(file.name);
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    extension === "heic" ||
    extension === "heif"
  );
}

export function isSupportedPhoto(file: File) {
  const extension = extensionOf(file.name);

  if (file.type.startsWith("video/") || VIDEO_EXTENSIONS.has(extension)) {
    return false;
  }

  return SUPPORTED_IMAGE_TYPES.has(file.type.toLowerCase()) || SUPPORTED_EXTENSIONS.has(extension);
}

function inferredImageType(file: File) {
  const extension = extensionOf(file.name);

  if (file.type === "image/jpeg" || file.type === "image/jpg" || extension === "jpg" || extension === "jpeg") {
    return "image/jpeg";
  }

  if (file.type === "image/png" || extension === "png") {
    return "image/png";
  }

  if (file.type === "image/webp" || extension === "webp") {
    return "image/webp";
  }

  return file.type;
}

async function hasValidSignature(file: File) {
  if (isHeicPhoto(file)) {
    return true;
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const type = inferredImageType(file);

  if (type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (type === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (value, index) => bytes[index] === value,
    );
  }

  return (
    type === "image/webp" &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  );
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

async function decodePhoto(blob: Blob): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Older Safari versions are handled by the image-element fallback below.
    }
  }

  const objectUrl = URL.createObjectURL(blob);
  const image = new window.Image();
  image.decoding = "async";

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("image-decode-failed"));
      image.src = objectUrl;
    });

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => {
        image.src = "";
        URL.revokeObjectURL(objectUrl);
      },
    };
  } catch (error) {
    image.src = "";
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }

        reject(new Error("jpeg-encode-failed"));
      },
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}

export async function preparePhotoForUpload(file: File) {
  if (!isSupportedPhoto(file) || !(await hasValidSignature(file))) {
    throw new Error("invalid-photo");
  }

  let sourceBlob: Blob = file;
  let decoded: DecodedImage | null = null;
  let canvas: HTMLCanvasElement | null = null;

  try {
    if (isHeicPhoto(file)) {
      const { heicTo } = await import("heic-to");
      sourceBlob = await heicTo({
        blob: file,
        type: "image/jpeg",
        quality: JPEG_QUALITY,
      });
    }

    decoded = await decodePhoto(sourceBlob);

    if (!decoded.width || !decoded.height) {
      throw new Error("invalid-dimensions");
    }

    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(decoded.width, decoded.height));
    const width = Math.max(1, Math.round(decoded.width * scale));
    const height = Math.max(1, Math.round(decoded.height * scale));

    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      throw new Error("canvas-unavailable");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(decoded.source, 0, 0, width, height);

    return await canvasToJpeg(canvas);
  } finally {
    decoded?.release();

    if (canvas) {
      canvas.width = 1;
      canvas.height = 1;
      canvas = null;
    }

    sourceBlob = new Blob();
  }
}
