export const maximumPictureZoom = 4;
export const initialPictureCrop = { zoom: 1, x: 0.5, y: 0.5 };
function clamp(value, minimum, maximum) {
    return Math.min(Math.max(value, minimum), maximum);
}
/** The source rectangle of a crop. It always stays in the picture. */
export function pictureArea(size, aspectRatio, crop) {
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
function clampPictureCrop(size, aspectRatio, crop) {
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
export function movePictureCrop(size, aspectRatio, crop, dx, dy) {
    const area = pictureArea(size, aspectRatio, crop);
    return clampPictureCrop(size, aspectRatio, {
        zoom: crop.zoom,
        x: crop.x + (dx * area.width) / size.width,
        y: crop.y + (dy * area.height) / size.height,
    });
}
/** Change the zoom and keep the centre of the visible part. */
export function zoomPictureCrop(size, aspectRatio, crop, zoom) {
    return clampPictureCrop(size, aspectRatio, { ...crop, zoom });
}
function encode(canvas, type, quality) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob === null)
                reject(new Error("The picture is not readable."));
            else
                resolve(blob);
        }, type, quality);
    });
}
function draw(source, area, width, height, opaque) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (context === null)
        throw new Error("Canvas is not available.");
    if (opaque) {
        // A JPEG has no transparency: transparent parts become white.
        context.fillStyle = "#fff";
        context.fillRect(0, 0, width, height);
    }
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, area.x, area.y, area.width, area.height, 0, 0, width, height);
    return canvas;
}
/** Draw the area of a picture at the output size and encode it. */
export async function renderPicture(source, area, aspectRatio, { quality = 0.9, type = "image/webp", width = 256 } = {}) {
    const outputWidth = Math.max(1, Math.round(width));
    const outputHeight = Math.max(1, Math.round(outputWidth / aspectRatio));
    const canvas = draw(source, area, outputWidth, outputHeight, type === "image/jpeg");
    const blob = await encode(canvas, type, quality);
    // A browser without the encoder gives a PNG, which can be too large.
    if (blob.type === type || type === "image/png")
        return blob;
    return encode(draw(source, area, outputWidth, outputHeight, true), "image/jpeg", quality);
}
//# sourceMappingURL=pictureCrop.js.map