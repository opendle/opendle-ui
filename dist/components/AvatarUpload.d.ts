import { type AvatarShape } from "./Avatar.js";
import { type AvatarUploadLabels } from "./identityLabels.js";
import { type PictureOutput } from "./pictureCrop.js";
export interface AvatarUploadProps {
    readonly name: string;
    readonly src: string | null;
    /** Receives the cropped picture at the output size and in its format. */
    readonly onUpload: (picture: Blob) => Promise<void>;
    readonly onRemove: () => Promise<void>;
    readonly errorMessage: (error: unknown) => string;
    /** The frame of the preview and of the crop. The default is `rounded`. */
    readonly shape?: AvatarShape;
    /** The width divided by the height of the picture. The default is 1. */
    readonly aspectRatio?: number;
    /** The default is a WebP picture 256 pixels wide, quality 0.9. */
    readonly output?: PictureOutput;
    /**
     * `section` is a titled card. `inline` is the picture above its buttons,
     * for a column in a host card.
     */
    readonly appearance?: "section" | "inline";
    readonly disabled?: boolean;
    readonly labels?: Partial<AvatarUploadLabels>;
}
/** Show, crop, replace and remove the picture of an account. */
export declare function AvatarUpload({ appearance, aspectRatio, disabled, errorMessage, labels, name, onRemove, onUpload, output, shape, src, }: AvatarUploadProps): import("react").JSX.Element;
//# sourceMappingURL=AvatarUpload.d.ts.map