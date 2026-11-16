/** Calendar date helpers. Named zones are optional. */
export type CalendarMode = "month" | "week" | "timeline";
/** A local calendar day as `YYYY-MM-DD`. */
export declare function calendarDayKey(date: Date, timeZone?: string): string;
/** The local noon of a `YYYY-MM-DD` day. Noon is safe on clock-change days. */
export declare function calendarDayDate(day: string): Date;
/** The days that a month or week view shows, from Monday to Sunday. */
export declare function calendarGridDays(mode: "month" | "week", anchor: string): readonly string[];
export interface CalendarPeriod {
    /** The first instant that the view shows. */
    readonly from: Date;
    /** The first instant after the view. */
    readonly to: Date;
}
/** The time range of a month or week view, for a data request. */
export declare function calendarPeriod(mode: "month" | "week", anchor: string, timeZone?: string): CalendarPeriod;
/** Move the anchor day by one month or one week. */
export declare function shiftCalendarAnchor(mode: "month" | "week", anchor: string, steps: number): string;
/** The heading of a month or week view, for example "November 2026". */
export declare function calendarTitle(mode: "month" | "week", anchor: string, locale?: string): string;
//# sourceMappingURL=calendarDates.d.ts.map