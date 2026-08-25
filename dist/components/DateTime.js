import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from "react";
function parseDate(value) {
    if (value === null || value === undefined || value === "")
        return null;
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
}
const displayOptionNames = [
    "dateStyle",
    "timeStyle",
    "weekday",
    "era",
    "year",
    "month",
    "day",
    "dayPeriod",
    "hour",
    "minute",
    "second",
    "fractionalSecondDigits",
    "timeZoneName",
];
function dateTimeFormatOptions(format) {
    if (format && displayOptionNames.some((name) => name in format)) {
        return format;
    }
    return {
        dateStyle: "medium",
        timeStyle: "short",
        ...format,
    };
}
export function DateTime({ className, fallback = "—", format, locale, value, ...props }) {
    const formatter = useMemo(() => {
        try {
            return new Intl.DateTimeFormat(locale, dateTimeFormatOptions(format));
        }
        catch {
            return null;
        }
    }, [format, locale]);
    const date = parseDate(value);
    if (!date || !formatter) {
        return (_jsx("span", { ...props, className: ["od-date-time", "od-date-time-invalid", className]
                .filter(Boolean)
                .join(" "), children: fallback }));
    }
    return (_jsx("time", { ...props, className: ["od-date-time", className].filter(Boolean).join(" "), dateTime: date.toISOString(), children: formatter.format(date) }));
}
//# sourceMappingURL=DateTime.js.map