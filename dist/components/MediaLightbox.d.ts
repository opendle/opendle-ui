import { type DialogHTMLAttributes, type ReactNode } from "react";
export type MediaLightboxKind = "image" | "pdf" | "video";
export interface MediaLightboxProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"> {
    readonly open: boolean;
    readonly title: string;
    /** A host-owned blob URL or a same-origin path that starts with `/`. */
    readonly source: string;
    readonly kind: MediaLightboxKind;
    readonly onClose: () => void;
    readonly imageAlt?: string;
    /** A video picture to show before playback, with the same URL rules. */
    readonly poster?: string;
    /** Short facts below the title, for example the type and the date. */
    readonly details?: ReactNode;
    /** Show the previous item. The left arrow key does the same. */
    readonly onPrevious?: () => void;
    /** Show the next item. The right arrow key does the same. */
    readonly onNext?: () => void;
}
/** A controlled modal preview of one host-owned image, video or PDF. */
export declare function MediaLightbox({ className, details, imageAlt, kind, onClose, onNext, onPrevious, open, poster, source, title, ...props }: MediaLightboxProps): import("react").JSX.Element;
//# sourceMappingURL=MediaLightbox.d.ts.map