import { type DialogHTMLAttributes } from "react";
export interface MediaLightboxProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, "children" | "onCancel" | "onClick" | "onClose" | "open" | "title"> {
    readonly open: boolean;
    readonly title: string;
    readonly source: string;
    readonly kind: "image" | "pdf";
    readonly onClose: () => void;
    readonly imageAlt?: string;
}
/** A controlled modal preview for one host-owned image or PDF blob URL. */
export declare function MediaLightbox({ className, imageAlt, kind, onClose, open, source, title, ...props }: MediaLightboxProps): import("react").JSX.Element;
//# sourceMappingURL=MediaLightbox.d.ts.map