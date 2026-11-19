export interface RelativeTimeOptions {
    /** The reference instant. The default is the current time. */
    readonly now?: Date | number;
    readonly locale?: Intl.LocalesArgument;
    /** The time zone that sets the calendar days, for "tomorrow" or "yesterday". */
    readonly timeZone?: string | undefined;
    readonly unitStyle?: Intl.RelativeTimeFormatStyle | undefined;
}
/**
 * An instant relative to now, with a precision that decreases with the
 * distance: "now", "in 5 minutes", "3 hours ago", "tomorrow", "in 4 days",
 * "2 weeks ago", "in 3 months", "2 years ago".
 */
export declare function formatRelativeTime(value: Date | number | string, { locale, now, timeZone, unitStyle, }?: RelativeTimeOptions): string;
//# sourceMappingURL=formatRelativeTime.d.ts.map