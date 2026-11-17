import type { ReactNode } from "react";
import { type TagColors, type TagFilterChannel, type TagFilterLabels, type TagFilterValue } from "./calendarLabels.js";
export interface TagFilterBarProps {
    readonly channels: readonly TagFilterChannel[];
    readonly tags: readonly string[];
    /** The colour key, from 1 to 12, of each tag. */
    readonly tagColors?: TagColors;
    readonly value: TagFilterValue;
    readonly onChange: (value: TagFilterValue) => void;
    readonly labels?: TagFilterLabels;
    readonly className?: string;
    /**
     * Other filters of the view, for example a search field. They come first.
     * The channel and tag choices follow them, or wrap below them as one row.
     */
    readonly controls?: ReactNode;
}
/**
 * Filters for channels and tags, with the AND or OR logic of the tags. A
 * group with no entry does not show.
 */
export declare function TagFilterBar({ channels, className, controls, labels, onChange, tagColors, tags, value, }: TagFilterBarProps): import("react").JSX.Element | null;
//# sourceMappingURL=TagFilterBar.d.ts.map