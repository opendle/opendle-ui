import { type ReactNode } from "react";
import { type MediaAttachmentListLabels } from "./mediaAttachmentLabels.js";
export type MediaAttachmentKind = "image" | "video" | "file";
export interface MediaAttachment {
    readonly id: string;
    readonly kind: MediaAttachmentKind;
    /** A same-origin or blob address of a small picture, or `null`. */
    readonly previewUrl: string | null;
    /** The accessible name of the item, for example `Image 2`. */
    readonly label: string;
    /** Seconds of a video. */
    readonly duration?: number | null;
    /** The part of an upload that is done, from 0 to 1. */
    readonly progress?: number | null;
    /** Why the item cannot be used. */
    readonly error?: string | null;
    /** A short mark on the picture, for example `ALT`. */
    readonly badge?: string | null;
}
export interface MediaAttachmentListProps {
    readonly items: readonly MediaAttachment[];
    /** Put the item at `from` at the position `to`. Without it, no reorder. */
    readonly onMove?: (from: number, to: number) => void;
    readonly onRemove: (id: string) => void;
    /** Open a large preview of the item. */
    readonly onOpen?: (id: string) => void;
    /** More actions of one item, for example a button for its alternative text. */
    readonly actions?: (item: MediaAttachment, index: number) => ReactNode;
    /** The last tile, for example a button that adds a file. */
    readonly children?: ReactNode;
    readonly disabled?: boolean;
    readonly labels?: MediaAttachmentListLabels;
    readonly className?: string;
}
/**
 * The ordered files of a post: square previews that move by drag and drop or
 * with the move buttons, and a remove button on each.
 */
export declare function MediaAttachmentList({ actions, children, className, disabled, items, labels, onMove, onOpen, onRemove, }: MediaAttachmentListProps): import("react").JSX.Element;
//# sourceMappingURL=MediaAttachmentList.d.ts.map