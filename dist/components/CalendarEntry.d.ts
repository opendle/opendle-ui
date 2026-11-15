import { type CalendarFollowUpLabels, type CalendarItem, type CalendarItemState } from "./calendarItems.js";
export interface CalendarEntryProps {
    readonly item: CalendarItem;
    /** The time of the entry, already formatted. */
    readonly time: string;
    /** A day before the time, for a list that is not grouped by day. */
    readonly date?: string;
    readonly onSelect: (item: CalendarItem) => void;
    /** `row` puts all parts on one line when the width permits. */
    readonly layout?: "card" | "row";
    readonly stateLabels?: Readonly<Record<CalendarItemState, string>>;
    readonly followUpLabels?: CalendarFollowUpLabels;
    readonly className?: string;
}
/** One entry of a calendar or of a list of posts, with its network badges. */
export declare function CalendarEntry({ className, date, item, followUpLabels, layout, onSelect, stateLabels, time, }: CalendarEntryProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarEntry.d.ts.map