import { type AvatarUploadLabels } from "./identityLabels.js";
export interface AvatarUploadProps {
    readonly name: string;
    readonly src: string | null;
    /** Receives a square picture of at most `pixels` on each side. */
    readonly onUpload: (picture: Blob) => Promise<void>;
    readonly onRemove: () => Promise<void>;
    readonly errorMessage: (error: unknown) => string;
    readonly pixels?: number;
    readonly disabled?: boolean;
    readonly labels?: AvatarUploadLabels;
}
/** Show, replace and remove the picture of one account. */
export declare function AvatarUpload({ disabled, errorMessage, labels, name, onRemove, onUpload, pixels, src, }: AvatarUploadProps): import("react").JSX.Element;
//# sourceMappingURL=AvatarUpload.d.ts.map