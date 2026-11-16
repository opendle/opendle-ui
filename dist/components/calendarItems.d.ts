import type { NetworkName } from "./networks.js";
export type CalendarItemState = "draft" | "scheduled" | "publishing" | "published" | "failed" | "cancelled";
export interface CalendarItemTarget {
    readonly id: string;
    readonly network: NetworkName;
    readonly state: CalendarItemState;
}
/** A comment or a like that follows the post on one network. */
export interface CalendarFollowUp {
    readonly id: string;
    readonly kind: "comment" | "like";
    readonly state: CalendarItemState;
}
/** One entry of the calendar. It can go to several networks. */
export interface CalendarItem {
    readonly id: string;
    /** The ISO 8601 instant of the entry. */
    readonly start: string;
    readonly title: string;
    /** A small square picture of the media. A video gets a play mark. */
    readonly preview?: {
        readonly src: string;
        readonly video?: boolean;
    };
    /** A CSS colour for the bar at the start of the entry. */
    readonly color?: string;
    /** A short line of facts, for example "18.4K views · 37 comments". */
    readonly summary?: string;
    readonly targets: readonly CalendarItemTarget[];
    /** The comments and likes after the publication, on all networks. */
    readonly followUps?: readonly CalendarFollowUp[];
}
export interface CalendarFollowUpLabels {
    readonly comment: string;
    readonly like: string;
}
export interface CalendarBoardLabels {
    readonly board: string;
    readonly today: string;
    readonly empty: string;
    readonly earlier: string;
    readonly later: string;
    readonly time: string;
    readonly states: Readonly<Record<CalendarItemState, string>>;
    readonly followUps: CalendarFollowUpLabels;
}
export declare const calendarBoardLabels: CalendarBoardLabels;
/** The most urgent state of a list of states. */
export declare function urgentState(states: readonly CalendarItemState[]): CalendarItemState;
/** The state of an entry: the most urgent state of its networks. */
export declare function calendarItemState(item: CalendarItem): CalendarItemState;
//# sourceMappingURL=calendarItems.d.ts.map