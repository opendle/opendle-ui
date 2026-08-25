import { useMemo, type ReactNode, type TimeHTMLAttributes } from "react";

export interface DateTimeProps extends Omit<
  TimeHTMLAttributes<HTMLTimeElement>,
  "children" | "dateTime"
> {
  readonly fallback?: ReactNode;
  readonly format?: Intl.DateTimeFormatOptions;
  readonly locale?: Intl.LocalesArgument;
  readonly value: Date | number | string | null | undefined;
}

function parseDate(
  value: Date | number | string | null | undefined,
): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

const displayOptionNames: readonly (keyof Intl.DateTimeFormatOptions)[] = [
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

function dateTimeFormatOptions(
  format: Intl.DateTimeFormatOptions | undefined,
): Intl.DateTimeFormatOptions {
  if (format && displayOptionNames.some((name) => name in format)) {
    return format;
  }
  return {
    dateStyle: "medium",
    timeStyle: "short",
    ...format,
  };
}

export function DateTime({
  className,
  fallback = "—",
  format,
  locale,
  value,
  ...props
}: DateTimeProps) {
  const formatter = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, dateTimeFormatOptions(format));
    } catch {
      return null;
    }
  }, [format, locale]);
  const date = parseDate(value);
  if (!date || !formatter) {
    return (
      <span
        {...props}
        className={["od-date-time", "od-date-time-invalid", className]
          .filter(Boolean)
          .join(" ")}
      >
        {fallback}
      </span>
    );
  }

  return (
    <time
      {...props}
      className={["od-date-time", className].filter(Boolean).join(" ")}
      dateTime={date.toISOString()}
    >
      {formatter.format(date)}
    </time>
  );
}
