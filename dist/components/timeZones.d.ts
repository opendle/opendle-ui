/** Named-zone conversion for calendar dates and datetime-local controls. */
export interface TimeZoneParts {
    readonly year: number;
    readonly month: number;
    readonly day: number;
    readonly hour: number;
    readonly minute: number;
    readonly second: number;
}
/** Calendar fields in a named zone. Omit the zone for the browser default. */
export declare function timeZoneParts(date: Date, timeZone?: string): TimeZoneParts;
/** A named-zone calendar day, with no dependence on the browser zone. */
export declare function timeZoneDayKey(date: Date, timeZone?: string): string;
/** The minute value of a datetime-local control in the requested zone. */
export declare function dateTimeInputValue(value: Date | string, timeZone?: string): string;
/**
 * Convert a local control value to an ISO instant. The default rejects both
 * missing and repeated clock times. An explicit earlier/later choice follows
 * the same clock-change rule as Temporal disambiguation.
 */
export declare function dateTimeInputInstant(value: string, timeZone?: string, disambiguation?: "reject" | "earlier" | "later"): string | null;
//# sourceMappingURL=timeZones.d.ts.map