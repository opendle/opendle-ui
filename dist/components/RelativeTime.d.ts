import { type ReactNode, type TimeHTMLAttributes } from "react";
export interface RelativeTimeProps extends Omit<TimeHTMLAttributes<HTMLTimeElement>, "children" | "dateTime"> {
    readonly value: Date | number | string | null | undefined;
    readonly fallback?: ReactNode;
    readonly locale?: Intl.LocalesArgument;
    /** The time zone of the default title. */
    readonly timeZone?: string | undefined;
    readonly unitStyle?: Intl.RelativeTimeFormatStyle | undefined;
}
/**
 * An instant relative to now, for example "in 5 minutes" or "1 day, 12 hours
 * ago". It changes each minute. The title gives the full date and time.
 */
export declare function RelativeTime({ className, fallback, locale, timeZone, title, unitStyle, value, ...props }: RelativeTimeProps): import("react").JSX.Element;
//# sourceMappingURL=RelativeTime.d.ts.map