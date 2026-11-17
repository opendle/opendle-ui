import { type CalendarMode } from "./calendarDates.js";
import { type CalendarBoardLabels, type CalendarItem } from "./calendarItems.js";
export interface CalendarBoardProps {
    readonly mode: CalendarMode;
    /** A `YYYY-MM-DD` day in the month or week to show. */
    readonly anchor: string;
    /** The current `YYYY-MM-DD` day. */
    readonly today: string;
    readonly items: readonly CalendarItem[];
    readonly onSelect: (item: CalendarItem) => void;
    /** The host permits this entry to move. Only future entries can move. */
    readonly canMove?: (item: CalendarItem) => boolean;
    /** A month keeps the local time. A week uses the destination half hour. */
    readonly onMove?: (item: CalendarItem, start: string) => void;
    /**
     * Create an entry on a day that is not past. The week view also gives the
     * half-hour slot (0 to 47) of a click on an empty part of a row.
     */
    readonly onCreate?: (day: string, slot?: number) => void;
    /** Timeline: more entries exist before the first one. */
    readonly hasEarlier?: boolean;
    /** Timeline: more entries exist after the last one. */
    readonly hasLater?: boolean;
    /** Timeline: called when the reader comes near the start. */
    readonly onLoadEarlier?: () => void;
    /** Timeline: called when the reader comes near the end. */
    readonly onLoadLater?: () => void;
    readonly locale?: string;
    /** The display and drag zone. Omit it for the browser zone. */
    readonly timeZone?: string;
    /** The present time of the week view. The default is the browser clock. */
    readonly now?: Date;
    readonly labels?: CalendarBoardLabels;
    readonly className?: string;
}
/**
 * A calendar of entries that go to one or more networks. It has a month
 * view, a week view and a continuous timeline. The host owns the data.
 */
export declare function CalendarBoard({ anchor, canMove, className, hasEarlier, hasLater, items, labels, locale, mode, now, onLoadEarlier, onCreate, onLoadLater, onMove, onSelect, today, timeZone, }: CalendarBoardProps): import("react").JSX.Element;
//# sourceMappingURL=CalendarBoard.d.ts.map