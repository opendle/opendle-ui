import type { MediaAttachmentKind } from "./MediaAttachmentList.js";
export interface MediaGridItem {
    readonly id: string;
    readonly kind: MediaAttachmentKind;
    /** A same-origin or blob address of a small picture, or `null`. */
    readonly previewUrl: string | null;
    /** The accessible name, for example a title of the file. */
    readonly label: string;
    /** A short fact below the picture, for example a date. */
    readonly detail?: string;
    readonly duration?: number | null;
    /** The item cannot be selected. */
    readonly disabled?: boolean;
}
export interface MediaGridPickerProps {
    /** The accessible name of the group. */
    readonly label: string;
    readonly items: readonly MediaGridItem[];
    readonly selected: readonly string[];
    readonly onToggle: (id: string) => void;
    readonly className?: string;
}
/**
 * A grid of square previews. Each one is a toggle button, so the user can
 * select several files with the pointer or the keyboard. A selected item shows
 * its place in the selection.
 */
export declare function MediaGridPicker({ className, items, label, onToggle, selected, }: MediaGridPickerProps): import("react").JSX.Element;
//# sourceMappingURL=MediaGridPicker.d.ts.map