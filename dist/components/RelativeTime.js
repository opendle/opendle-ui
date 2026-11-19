import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { classes } from "./classes.js";
import { parseDate } from "./dateValue.js";
import { formatRelativeTime } from "./formatRelativeTime.js";
import { useMinute } from "./useMinute.js";
/**
 * An instant relative to now, for example "in 5 minutes" or "1 day, 12 hours
 * ago". It changes each minute. The title gives the full date and time.
 */
export function RelativeTime({ className, fallback = "—", locale, timeZone, title, unitStyle, value, ...props }) {
    const now = useMinute();
    const fullDate = useMemo(() => {
        try {
            return new Intl.DateTimeFormat(locale, {
                dateStyle: "full",
                timeStyle: "short",
                timeZone,
            });
        }
        catch {
            return null;
        }
    }, [locale, timeZone]);
    const date = parseDate(value);
    let label = null;
    if (date !== null && fullDate !== null) {
        try {
            label = formatRelativeTime(date, { locale, now, unitStyle });
        }
        catch {
            label = null;
        }
    }
    if (date === null || fullDate === null || label === null) {
        return (_jsx("span", { ...props, className: classes("od-relative-time", "od-relative-time-invalid", className), children: fallback }));
    }
    return (_jsx("time", { ...props, className: classes("od-relative-time", className), dateTime: date.toISOString(), title: title ?? fullDate.format(date), children: label }));
}
//# sourceMappingURL=RelativeTime.js.map