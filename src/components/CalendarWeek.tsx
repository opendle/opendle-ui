import type { CSSProperties } from "react";

import { CalendarEntry } from "./CalendarEntry.js";
import {
  calendarDayDate,
  calendarDayKey,
  calendarGridDays,
} from "./calendarDates.js";
import type { CalendarBoardLabels, CalendarItem } from "./calendarItems.js";
import { useMinute } from "./useMinute.js";
import type { CalendarDrag } from "./useCalendarDrag.js";

export interface CalendarWeekFormats {
  readonly time: Intl.DateTimeFormat;
  readonly weekday: Intl.DateTimeFormat;
  readonly fullDay: Intl.DateTimeFormat;
}

export interface CalendarWeekProps {
  readonly anchor: string;
  readonly drag: CalendarDrag;
  readonly today: string;
  /** The entries of each `YYYY-MM-DD` day, in time order. */
  readonly groups: ReadonlyMap<string, readonly CalendarItem[]>;
  readonly formats: CalendarWeekFormats;
  readonly labels: CalendarBoardLabels;
  readonly onSelect: (item: CalendarItem) => void;
  /** The present time. Without it, the clock of the browser gives it. */
  readonly now?: Date | undefined;
}

const halfHours = Array.from({ length: 48 }, (_, index) => index);

function slotOf(item: CalendarItem): number {
  const start = new Date(item.start);
  return start.getHours() * 2 + (start.getMinutes() >= 30 ? 1 : 0);
}

/**
 * One week against a time axis of 24 hours. A row is one half hour. A row
 * grows with its entries, and a row without entries stays thin.
 */
export function CalendarWeek({
  anchor,
  drag,
  formats,
  groups,
  labels,
  now,
  onSelect,
  today,
}: CalendarWeekProps) {
  const clock = useMinute();
  const present = now ?? clock;
  const days = calendarGridDays("week", anchor);
  // The half hour of the present, and the part of it that is over.
  const onToday = calendarDayKey(present) === today;
  const nowSlot = present.getHours() * 2 + (present.getMinutes() >= 30 ? 1 : 0);
  const nowPart = (present.getMinutes() % 30) / 30;
  return (
    <table className="od-calendar-week">
      <thead>
        <tr>
          <th className="od-calendar-week-corner" scope="col">
            <span className="od-visually-hidden">{labels.time}</span>
          </th>
          {days.map((day) => {
            const date = calendarDayDate(day);
            return (
              <th
                aria-current={day === today ? "date" : undefined}
                aria-label={formats.fullDay.format(date)}
                data-today={day === today}
                key={day}
                scope="col"
              >
                <span className="od-calendar-day-head">
                  <span className="od-calendar-week-weekday">
                    {formats.weekday.format(date)}
                  </span>
                  <span className="od-calendar-day-number">
                    {date.getDate()}
                  </span>
                </span>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {halfHours.map((slot) => {
          const hour = Math.floor(slot / 2);
          const label = formats.time.format(new Date(2000, 0, 1, hour, 0));
          return (
            <tr data-half={slot % 2 === 1} key={slot}>
              {slot % 2 === 0 ? (
                <th className="od-calendar-week-hour" rowSpan={2} scope="row">
                  <time>{label}</time>
                </th>
              ) : null}
              {days.map((day) => {
                const current = day === today && onToday && slot === nowSlot;
                const entries = (groups.get(day) ?? []).filter(
                  (item) => slotOf(item) === slot,
                );
                return (
                  <td
                    data-now={current || undefined}
                    data-past={
                      day < today ||
                      (day === today && onToday && slot < nowSlot)
                    }
                    data-today={day === today}
                    key={day}
                    {...drag.target(day, formats.time, slot)}
                    style={
                      current
                        ? ({
                            "--od-calendar-now": `${String(Math.round(nowPart * 1000) / 10)}%`,
                          } as CSSProperties)
                        : undefined
                    }
                  >
                    {entries.length === 0 ? null : (
                      <div className="od-calendar-week-cell">
                        {entries.map((item) => (
                          <CalendarEntry
                            item={item}
                            drag={drag.entry(item)}
                            key={item.id}
                            onSelect={onSelect}
                            followUpLabels={labels.followUps}
                            stateLabels={labels.states}
                            time={formats.time.format(new Date(item.start))}
                          />
                        ))}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
