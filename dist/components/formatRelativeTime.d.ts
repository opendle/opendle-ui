export interface RelativeTimeOptions {
    /** The reference instant. The default is the current time. */
    readonly now?: Date | number;
    readonly locale?: Intl.LocalesArgument;
    readonly unitStyle?: Intl.RelativeTimeFormatStyle | undefined;
}
/**
 * An instant relative to now, in one or two units: "now", "in 13m",
 * "2h 15m ago", "in 1d 12h", "5d ago", "in 1w 3d", "in 4mo", "1y 2mo ago".
 * The second unit shows only while the first is below 3.
 */
export declare function formatRelativeTime(value: Date | number | string, { locale, now, unitStyle }?: RelativeTimeOptions): string;
//# sourceMappingURL=formatRelativeTime.d.ts.map