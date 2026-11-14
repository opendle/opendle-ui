export interface DateRange {
    /** The first `YYYY-MM-DD` day. */
    readonly from: string;
    /** The last `YYYY-MM-DD` day. */
    readonly to: string;
}
export interface DateRangePreset {
    readonly days: number;
    readonly label: string;
}
/** The range of a number of days that ends at `today`. */
export declare function lastDays(today: string, days: number): DateRange;
//# sourceMappingURL=dateRange.d.ts.map