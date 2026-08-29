import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const WATERMARK_PATH = path.join(
  process.cwd(),
  "public",
  "assets",
  "gti-click",
  "watermark-aws-summit-2026.png",
);

const WATERMARK_OPACITY = 0.92;
const MIN_WATERMARK_WIDTH = 120;
const MAX_WATERMARK_WIDTH = 260;
const WATERMARK_WIDTH_RATIO = 0.14;
const MARGIN_RATIO = 0.025;
const MIN_MARGIN = 20;

type SupportedFormat = "jpeg" | "png" | "webp";

export type WatermarkedDownload = {
  data: Buffer;
  extension: "jpg" | "png" | "webp";
  contentType: "image/jpeg" | "image/png" | "image/webp";
};

let watermarkAssetPromise: Promise<Buffer> | undefined;

function getWatermarkAsset() {
  watermarkAssetPromise ??= readFile(WATERMARK_PATH);
  return watermarkAssetPromise;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getOrientedDimensions(
  width: number,
  height: number,
  orientation?: number,
) {
  const swapsDimensions = orientation !== undefined && orientation >= 5 && orientation <= 8;
  return swapsDimensions
    ? { width: height, height: width }
    : { width, height };
}

async function createWatermark(
  asset: Buffer,
  requestedWidth: number,
  maximumHeight: number,
) {
  let result = await sharp(asset)
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({ width: requestedWidth, withoutEnlargement: false })
    .ensureAlpha()
    .png()
    .toBuffer({ resolveWithObject: true });

  if (result.info.height > maximumHeight) {
    const adjustedWidth = Math.max(
      1,
      Math.floor(result.info.width * (maximumHeight / result.info.height)),
    );
    result = await sharp(asset)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize({ width: adjustedWidth, withoutEnlargement: false })
      .ensureAlpha()
      .png()
      .toBuffer({ resolveWithObject: true });
  }

  const opacityMask = await sharp({
    create: {
      width: result.info.width,
      height: result.info.height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: WATERMARK_OPACITY },
    },
  })
    .png()
    .toBuffer();

  const data = await sharp(result.data)
    .composite([{ input: opacityMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  return { data, width: result.info.width, height: result.info.height };
}

export async function createWatermarkedDownload(
  original: Buffer,
): Promise<WatermarkedDownload> {
  const source = sharp(original, { failOn: "error" });
  const metadata = await source.metadata();
  const format = metadata.format as SupportedFormat | undefined;

  if (
    !format ||
    !["jpeg", "png", "webp"].includes(format) ||
    !metadata.width ||
    !metadata.height
  ) {
    throw new Error("unsupported-image-format");
  }

  const dimensions = getOrientedDimensions(
    metadata.width,
    metadata.height,
    metadata.orientation,
  );
  const rightMargin = Math.max(MIN_MARGIN, Math.round(dimensions.width * MARGIN_RATIO));
  const bottomMargin = Math.max(MIN_MARGIN, Math.round(dimensions.height * MARGIN_RATIO));
  const maximumWatermarkWidth = Math.max(1, dimensions.width - rightMargin * 2);
  const maximumWatermarkHeight = Math.max(1, dimensions.height - bottomMargin * 2);
  const requestedWidth = Math.min(
    maximumWatermarkWidth,
    clamp(
      Math.round(dimensions.width * WATERMARK_WIDTH_RATIO),
      MIN_WATERMARK_WIDTH,
      MAX_WATERMARK_WIDTH,
    ),
  );
  const watermark = await createWatermark(
    await getWatermarkAsset(),
    requestedWidth,
    maximumWatermarkHeight,
  );
  const left = Math.max(0, dimensions.width - rightMargin - watermark.width);
  const top = Math.max(0, dimensions.height - bottomMargin - watermark.height);
  const pipeline = sharp(original, { failOn: "error" })
    .rotate()
    .composite([{ input: watermark.data, left, top, blend: "over" }]);

  if (format === "png") {
    return {
      data: await pipeline.png({ compressionLevel: 9 }).toBuffer(),
      extension: "png",
      contentType: "image/png",
    };
  }

  if (format === "webp") {
    return {
      data: await pipeline.webp({ quality: 92, smartSubsample: true }).toBuffer(),
      extension: "webp",
      contentType: "image/webp",
    };
  }

  return {
    data: await pipeline
      .jpeg({ quality: 92, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toBuffer(),
    extension: "jpg",
    contentType: "image/jpeg",
  };
}
