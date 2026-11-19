import { type CalendarFollowUpLabels, type CalendarItem, type CalendarItemState } from "./calendarItems.js";
import type { CalendarEntryDrag } from "./useCalendarDrag.js";
export interface CalendarEntryProps {
    readonly item: CalendarItem;
    /** The time of the entry, already formatted. */
    readonly time: string;
    /** A day before the time, for a list that is not grouped by day. */
    readonly date?: string;
    /**
     * Show the time relative to now, for example "in 3 hours". The date and the
     * time go to the title and to the accessible name.
     */
    readonly relative?: boolean;
    /** The time zone of the calendar days of a relative time. */
    readonly timeZone?: string | undefined;
    /** The unit length of a relative time: `narrow` gives "in 3h". */
    readonly unitStyle?: Intl.RelativeTimeFormatStyle | undefined;
    readonly onSelect: (item: CalendarItem) => void;
    /** Drag behavior supplied by the calendar board. */
    readonly drag?: CalendarEntryDrag | undefined;
    /** `row` puts all parts on one line when the width permits. */
    readonly layout?: "card" | "row";
    readonly stateLabels?: Readonly<Record<CalendarItemState, string>>;
    readonly followUpLabels?: CalendarFollowUpLabels;
    readonly className?: string;
}
/** One entry of a calendar or of a list of posts, with its network badges. */
export declare function CalendarEntry({ className, date, drag, item, followUpLabels, layout, onSelect, relative, stateLabels, time, timeZone, unitStyle, }: CalendarEntryProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarEntry.d.ts.map