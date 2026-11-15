import type { CalendarMode } from "./calendarDates.js";
import type { CalendarItemState } from "./calendarItems.js";
import type { NetworkName } from "./networks.js";
export interface CalendarHeaderLabels {
    readonly previous: string;
    readonly next: string;
    readonly today: string;
    readonly view: string;
    readonly modes: Readonly<Record<CalendarMode, string>>;
}
export declare const calendarHeaderLabels: CalendarHeaderLabels;
export interface PostDetailLabels {
    readonly close: string;
    readonly open: string;
    readonly retry: string;
    readonly play: string;
    readonly channels: string;
    readonly variants: string;
    readonly states: Readonly<Record<CalendarItemState, string>>;
}
export declare const postDetailLabels: PostDetailLabels;
export interface TagFilterChannel {
    readonly id: string;
    readonly network: NetworkName;
    /** The accessible name, for example the network and the account. */
    readonly label: string;
}
/** The colour key, from 1 to 12, of each tag name. */
export type TagColors = Readonly<Record<string, number>>;
export type TagFilterMatch = "all" | "any";
export interface TagFilterValue {
    /** Selected channel IDs. An empty list selects all channels. */
    readonly channels: readonly string[];
    readonly tags: readonly string[];
    readonly match: TagFilterMatch;
}
export declare const emptyTagFilter: TagFilterValue;
export interface TagFilterLabels {
    readonly filters: string;
    readonly channels: string;
    readonly tags: string;
    readonly match: string;
    readonly matchAll: string;
    readonly matchAny: string;
}
export declare const tagFilterLabels: TagFilterLabels;
//# sourceMappingURL=calendarLabels.d.ts.map