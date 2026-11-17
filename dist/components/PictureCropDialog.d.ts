import type { AvatarShape } from "./Avatar.js";
import type { AvatarUploadLabels } from "./identityLabels.js";
import { type PictureCrop, type PictureSize } from "./pictureCrop.js";
/** A picture that the browser decoded, with a URL for its preview. */
export interface LoadedPicture extends PictureSize {
    readonly url: string;
}
export interface PictureCropDialogProps {
    readonly picture: LoadedPicture | null;
    readonly crop: PictureCrop;
    readonly onCropChange: (crop: PictureCrop) => void;
    readonly aspectRatio: number;
    readonly shape: AvatarShape;
    readonly labels: AvatarUploadLabels;
    readonly pending: boolean;
    readonly failure: string | null;
    readonly onCancel: () => void;
    readonly onSave: () => void;
}
/**
 * Move and zoom a picture in a frame of a fixed aspect ratio. A drag, the
 * arrow keys, the zoom slider, the wheel, a pinch and the + and - keys change
 * the visible part.
 */
export declare function PictureCropDialog({ aspectRatio, crop, failure, labels, onCancel, onCropChange, onSave, pending, picture, shape, }: PictureCropDialogProps): import("react").JSX.Element;
//# sourceMappingURL=PictureCropDialog.d.ts.map