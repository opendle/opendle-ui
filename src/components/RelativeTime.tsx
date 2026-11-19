import { useMemo, type ReactNode, type TimeHTMLAttributes } from "react";

import { classes } from "./classes.js";
import { parseDate } from "./dateValue.js";
import { formatRelativeTime } from "./formatRelativeTime.js";
import { useMinute } from "./useMinute.js";

export interface RelativeTimeProps extends Omit<
  TimeHTMLAttributes<HTMLTimeElement>,
  "children" | "dateTime"
> {
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
export function RelativeTime({
  className,
  fallback = "—",
  locale,
  timeZone,
  title,
  unitStyle,
  value,
  ...props
}: RelativeTimeProps) {
  const now = useMinute();
  const fullDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "short",
        timeZone,
      });
    } catch {
      return null;
    }
  }, [locale, timeZone]);
  const date = parseDate(value);
  let label: string | null = null;
  if (date !== null && fullDate !== null) {
    try {
      label = formatRelativeTime(date, { locale, now, unitStyle });
    } catch {
      label = null;
    }
  }
  if (date === null || fullDate === null || label === null) {
    return (
      <span
        {...props}
        className={classes(
          "od-relative-time",
          "od-relative-time-invalid",
          className,
        )}
      >
        {fallback}
      </span>
    );
  }
  return (
    <time
      {...props}
      className={classes("od-relative-time", className)}
      dateTime={date.toISOString()}
      title={title ?? fullDate.format(date)}
    >
      {label}
    </time>
  );
}
