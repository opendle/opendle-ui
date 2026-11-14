import { type TagFilterChannel, type TagFilterLabels, type TagFilterValue } from "./calendarLabels.js";
export interface TagFilterBarProps {
    readonly channels: readonly TagFilterChannel[];
    readonly channelTags: readonly string[];
    readonly postTags: readonly string[];
    readonly value: TagFilterValue;
    readonly onChange: (value: TagFilterValue) => void;
    readonly labels?: TagFilterLabels;
    readonly className?: string;
}
/**
 * Filters for channels, channel tags and post tags, with the AND or OR logic
 * of the tags. A group with no entry does not show.
 */
export declare function TagFilterBar({ channelTags, channels, className, labels, onChange, postTags, value, }: TagFilterBarProps): import("react").JSX.Element | null;
//# sourceMappingURL=TagFilterBar.d.ts.map