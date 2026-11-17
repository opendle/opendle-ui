import type { CalendarBoardLabels, CalendarItem } from "./calendarItems.js";
import type { CalendarDrag } from "./useCalendarDrag.js";
export interface CalendarWeekFormats {
    readonly time: Intl.DateTimeFormat;
    readonly hour?: Intl.DateTimeFormat;
    readonly weekday: Intl.DateTimeFormat;
    readonly fullDay: Intl.DateTimeFormat;
}
export interface CalendarWeekProps {
    readonly anchor: string;
    readonly drag: CalendarDrag;
    readonly today: string;
    /** The entries of each `YYYY-MM-DD` day, in time order. */
    readonly groups: ReadonlyMap<string, readonly CalendarItem[]>;
    readonly formats: CalendarWeekFormats;
    readonly labels: CalendarBoardLabels;
    readonly onSelect: (item: CalendarItem) => void;
    /** Create an entry at a day, or at a half-hour slot of a day. */
    readonly onCreate?: ((day: string, slot?: number) => void) | undefined;
    /** The present time. Without it, the clock of the browser gives it. */
    readonly now?: Date | undefined;
    readonly timeZone?: string | undefined;
}
/**
 * One week against a time axis of 24 hours. A row is one half hour. A row
 * grows with its entries, and a row without entries stays thin.
 */
export declare function CalendarWeek({ anchor, drag, formats, groups, labels, now, onCreate, onSelect, today, timeZone, }: CalendarWeekProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarWeek.d.ts.map