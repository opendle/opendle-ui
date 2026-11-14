import { CalendarEntry } from "./CalendarEntry.js";
import { calendarDayDate, calendarGridDays } from "./calendarDates.js";
import type { CalendarBoardLabels, CalendarItem } from "./calendarItems.js";

export interface CalendarWeekFormats {
  readonly time: Intl.DateTimeFormat;
  readonly weekday: Intl.DateTimeFormat;
  readonly fullDay: Intl.DateTimeFormat;
}

export interface CalendarWeekProps {
  readonly anchor: string;
  readonly today: string;
  /** The entries of each `YYYY-MM-DD` day, in time order. */
  readonly groups: ReadonlyMap<string, readonly CalendarItem[]>;
  readonly formats: CalendarWeekFormats;
  readonly labels: CalendarBoardLabels;
  readonly onSelect: (item: CalendarItem) => void;
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
  formats,
  groups,
  labels,
  onSelect,
  today,
}: CalendarWeekProps) {
  const days = calendarGridDays("week", anchor);
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
              {days.map((day) => (
                <td data-today={day === today} key={day}>
                  {(groups.get(day) ?? []).map((item) =>
                    slotOf(item) === slot ? (
                      <CalendarEntry
                        item={item}
                        key={item.id}
                        onSelect={onSelect}
                        stateLabels={labels.states}
                        time={formats.time.format(new Date(item.start))}
                      />
                    ) : null,
                  )}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
