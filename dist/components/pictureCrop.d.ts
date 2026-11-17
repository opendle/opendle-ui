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
export declare const maximumPictureZoom = 4;
export declare const initialPictureCrop: PictureCrop;
/** The source rectangle of a crop. It always stays in the picture. */
export declare function pictureArea(size: PictureSize, aspectRatio: number, crop: PictureCrop): PictureArea;
/**
 * Move the visible part. `dx` and `dy` are fractions of the visible width and
 * height; a positive value shows more of the right or the bottom.
 */
export declare function movePictureCrop(size: PictureSize, aspectRatio: number, crop: PictureCrop, dx: number, dy: number): PictureCrop;
/** Change the zoom and keep the centre of the visible part. */
export declare function zoomPictureCrop(size: PictureSize, aspectRatio: number, crop: PictureCrop, zoom: number): PictureCrop;
/** Draw the area of a picture at the output size and encode it. */
export declare function renderPicture(source: CanvasImageSource, area: PictureArea, aspectRatio: number, { quality, type, width }?: PictureOutput): Promise<Blob>;
//# sourceMappingURL=pictureCrop.d.ts.map