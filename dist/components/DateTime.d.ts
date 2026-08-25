import { type ReactNode, type TimeHTMLAttributes } from "react";
export interface DateTimeProps extends Omit<TimeHTMLAttributes<HTMLTimeElement>, "children" | "dateTime"> {
    readonly fallback?: ReactNode;
    readonly format?: Intl.DateTimeFormatOptions;
    readonly locale?: Intl.LocalesArgument;
    readonly value: Date | number | string | null | undefined;
}
export declare function DateTime({ className, fallback, format, locale, value, ...props }: DateTimeProps): import("react").JSX.Element;
//# sourceMappingURL=DateTime.d.ts.map