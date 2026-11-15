import type { CalendarBoardLabels, CalendarItem } from "./calendarItems.js";
export interface CalendarWeekFormats {
    readonly time: Intl.DateTimeFormat;
    readonly weekday: Intl.DateTimeFormat;
    readonly fullDay: Intl.DateTimeFormat;
}
export interface CalendarWeekProps {
    readonly anchor: string;
    readonly today: string;
    /** The entries of each `YYYY-MM-DD` day, in time order. */
    readonly groups: ReadonlyMap<string, readonly CalendarItem[]>;
    readonly formats: CalendarWeekFormats;
    readonly labels: CalendarBoardLabels;
    readonly onSelect: (item: CalendarItem) => void;
    /** The present time. Without it, the clock of the browser gives it. */
    readonly now?: Date | undefined;
}
/**
 * One week against a time axis of 24 hours. A row is one half hour. A row
 * grows with its entries, and a row without entries stays thin.
 */
export declare function CalendarWeek({ anchor, formats, groups, labels, now, onSelect, today, }: CalendarWeekProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarWeek.d.ts.map