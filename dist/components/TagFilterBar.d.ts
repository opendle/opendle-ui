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
}
/**
 * Filters for channels and tags, with the AND or OR logic of the tags. A
 * group with no entry does not show.
 */
export declare function TagFilterBar({ channels, className, labels, onChange, tagColors, tags, value, }: TagFilterBarProps): import("react").JSX.Element | null;
//# sourceMappingURL=TagFilterBar.d.ts.map