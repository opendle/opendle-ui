/** The encoded format of a cropped picture. */
export type PictureType = "image/webp" | "image/png" | "image/jpeg";

/** The size and the format of a cropped picture. */
export interface PictureOutput {
  /** The width in pixels. The height follows the aspect ratio. */
  readonly width?: number;
  /** When the browser cannot encode this format, the picture is a JPEG. */
  readonly type?: PictureType;
  /** The quality of a WebP or JPEG picture, from 0 to 1. */
  readonly quality?: number;
}

export interface PictureSize {
  readonly width: number;
  readonly height: number;
}

/**
 * The visible part of a picture. Zoom 1 is the largest part with the aspect
 * ratio. `x` and `y` are its centre, as a fraction of the picture size.
 */
export interface PictureCrop {
  readonly zoom: number;
  readonly x: number;
  readonly y: number;
}

/** A rectangle in the pixels of the source picture. */
export interface PictureArea {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export const maximumPictureZoom = 4;
export const initialPictureCrop: PictureCrop = { zoom: 1, x: 0.5, y: 0.5 };

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

/** The source rectangle of a crop. It always stays in the picture. */
export function pictureArea(
  size: PictureSize,
  aspectRatio: number,
  crop: PictureCrop,
): PictureArea {
  const zoom = clamp(crop.zoom, 1, maximumPictureZoom);
  const width = Math.min(size.width, size.height * aspectRatio) / zoom;
  const height = width / aspectRatio;
  return {
    x: clamp(crop.x * size.width - width / 2, 0, size.width - width),
    y: clamp(crop.y * size.height - height / 2, 0, size.height - height),
    width,
    height,
  };
}

/** The same crop with its zoom and position in the limits. */
function clampPictureCrop(
  size: PictureSize,
  aspectRatio: number,
  crop: PictureCrop,
): PictureCrop {
  const area = pictureArea(size, aspectRatio, crop);
  return {
    zoom: clamp(crop.zoom, 1, maximumPictureZoom),
    x: (area.x + area.width / 2) / size.width,
    y: (area.y + area.height / 2) / size.height,
  };
}

/**
 * Move the visible part. `dx` and `dy` are fractions of the visible width and
 * height; a positive value shows more of the right or the bottom.
 */
export function movePictureCrop(
  size: PictureSize,
  aspectRatio: number,
  crop: PictureCrop,
  dx: number,
  dy: number,
): PictureCrop {
  const area = pictureArea(size, aspectRatio, crop);
  return clampPictureCrop(size, aspectRatio, {
    zoom: crop.zoom,
    x: crop.x + (dx * area.width) / size.width,
    y: crop.y + (dy * area.height) / size.height,
  });
}

/** Change the zoom and keep the centre of the visible part. */
export function zoomPictureCrop(
  size: PictureSize,
  aspectRatio: number,
  crop: PictureCrop,
  zoom: number,
): PictureCrop {
  return clampPictureCrop(size, aspectRatio, { ...crop, zoom });
}

function encode(
  canvas: HTMLCanvasElement,
  type: PictureType,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob === null) reject(new Error("The picture is not readable."));
        else resolve(blob);
      },
      type,
      quality,
    );
  });
}

function draw(
  source: CanvasImageSource,
  area: PictureArea,
  width: number,
  height: number,
  opaque: boolean,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Canvas is not available.");
  if (opaque) {
    // A JPEG has no transparency: transparent parts become white.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    source,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    width,
    height,
  );
  return canvas;
}

/** Draw the area of a picture at the output size and encode it. */
export async function renderPicture(
  source: CanvasImageSource,
  area: PictureArea,
  aspectRatio: number,
  { quality = 0.9, type = "image/webp", width = 256 }: PictureOutput = {},
): Promise<Blob> {
  const outputWidth = Math.max(1, Math.round(width));
  const outputHeight = Math.max(1, Math.round(outputWidth / aspectRatio));
  const canvas = draw(
    source,
    area,
    outputWidth,
    outputHeight,
    type === "image/jpeg",
  );
  const blob = await encode(canvas, type, quality);
  // A browser without the encoder gives a PNG, which can be too large.
  if (blob.type === type || type === "image/png") return blob;
  return encode(
    draw(source, area, outputWidth, outputHeight, true),
    "image/jpeg",
    quality,
  );
}
