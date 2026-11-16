import { useCallback, useLayoutEffect, useMemo, useRef } from "react";

import {
  calendarDayDate,
  calendarDayKey,
  calendarGridDays,
  type CalendarMode,
} from "./calendarDates.js";
import { CalendarEntry } from "./CalendarEntry.js";
import { CalendarWeek } from "./CalendarWeek.js";
import {
  calendarBoardLabels,
  type CalendarBoardLabels,
  type CalendarItem,
} from "./calendarItems.js";
import { classes } from "./classes.js";
import { useCalendarDrag, type CalendarDrag } from "./useCalendarDrag.js";

export interface CalendarBoardProps {
  readonly mode: CalendarMode;
  /** A `YYYY-MM-DD` day in the month or week to show. */
  readonly anchor: string;
  /** The current `YYYY-MM-DD` day. */
  readonly today: string;
  readonly items: readonly CalendarItem[];
  readonly onSelect: (item: CalendarItem) => void;
  /** The host permits this entry to move. Only future entries can move. */
  readonly canMove?: (item: CalendarItem) => boolean;
  /** A month keeps the local time. A week uses the destination half hour. */
  readonly onMove?: (item: CalendarItem, start: string) => void;
  /** Timeline: more entries exist before the first one. */
  readonly hasEarlier?: boolean;
  /** Timeline: more entries exist after the last one. */
  readonly hasLater?: boolean;
  /** Timeline: called when the reader comes near the start. */
  readonly onLoadEarlier?: () => void;
  /** Timeline: called when the reader comes near the end. */
  readonly onLoadLater?: () => void;
  readonly locale?: string;
  /** The display and drag zone. Omit it for the browser zone. */
  readonly timeZone?: string;
  /** The present time of the week view. The default is the browser clock. */
  readonly now?: Date;
  readonly labels?: CalendarBoardLabels;
  readonly className?: string;
}

interface DayGroup {
  readonly day: string;
  readonly items: readonly CalendarItem[];
  /** The first shown day of its month. */
  readonly startsMonth: boolean;
}

function groupByDay(
  items: readonly CalendarItem[],
  timeZone?: string,
): Map<string, CalendarItem[]> {
  const groups = new Map<string, CalendarItem[]>();
  const sorted = items.toSorted(
    (first, second) => Date.parse(first.start) - Date.parse(second.start),
  );
  for (const item of sorted) {
    const day = calendarDayKey(new Date(item.start), timeZone);
    const group = groups.get(day);
    if (group === undefined) groups.set(day, [item]);
    else group.push(item);
  }
  return groups;
}

interface Formats {
  readonly time: Intl.DateTimeFormat;
  readonly hour: Intl.DateTimeFormat;
  readonly weekday: Intl.DateTimeFormat;
  readonly fullDay: Intl.DateTimeFormat;
  readonly month: Intl.DateTimeFormat;
}

interface GridProps {
  readonly drag: CalendarDrag;
  readonly mode: "month" | "week";
  readonly anchor: string;
  readonly today: string;
  readonly groups: Map<string, CalendarItem[]>;
  readonly formats: Formats;
  readonly labels: CalendarBoardLabels;
  readonly onSelect: (item: CalendarItem) => void;
}

function Grid({
  anchor,
  drag,
  formats,
  groups,
  labels,
  mode,
  onSelect,
  today,
}: GridProps) {
  const days = calendarGridDays(mode, anchor);
  const anchorMonth = anchor.slice(0, 7);
  const hasItems = days.some((day) => groups.has(day));
  return (
    <>
      <div aria-hidden="true" className="od-calendar-weekdays">
        {days.slice(0, 7).map((day) => (
          <span key={day}>{formats.weekday.format(calendarDayDate(day))}</span>
        ))}
      </div>
      <ol className="od-calendar-grid">
        {days.map((day) => {
          const date = calendarDayDate(day);
          const items = groups.get(day) ?? [];
          return (
            <li
              className="od-calendar-day"
              data-empty={items.length === 0}
              data-outside={mode === "month" && day.slice(0, 7) !== anchorMonth}
              data-past={day < today}
              data-today={day === today}
              key={day}
              {...drag.target(day, formats.time)}
            >
              <time
                aria-current={day === today ? "date" : undefined}
                aria-label={formats.fullDay.format(date)}
                className="od-calendar-day-head"
                dateTime={day}
              >
                <span className="od-calendar-day-weekday">
                  {formats.weekday.format(date)}
                </span>
                <span className="od-calendar-day-number">{date.getDate()}</span>
              </time>
              {items.map((item) => (
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
            </li>
          );
        })}
      </ol>
      {hasItems ? null : <p className="od-calendar-empty">{labels.empty}</p>}
    </>
  );
}

interface TimelineProps {
  readonly today: string;
  readonly groups: Map<string, CalendarItem[]>;
  readonly formats: Formats;
  readonly labels: CalendarBoardLabels;
  readonly onSelect: (item: CalendarItem) => void;
  readonly hasEarlier: boolean;
  readonly hasLater: boolean;
  readonly onLoadEarlier: (() => void) | undefined;
  readonly onLoadLater: (() => void) | undefined;
}

function Timeline({
  formats,
  groups,
  hasEarlier,
  hasLater,
  labels,
  onLoadEarlier,
  onLoadLater,
  onSelect,
  today,
}: TimelineProps) {
  const days = useMemo<readonly DayGroup[]>(() => {
    const keys = new Set(groups.keys());
    keys.add(today);
    return [...keys].toSorted().map((day, index, sorted) => ({
      day,
      items: groups.get(day) ?? [],
      startsMonth: sorted[index - 1]?.slice(0, 7) !== day.slice(0, 7),
    }));
  }, [groups, today]);

  const rootRef = useRef<HTMLDivElement>(null);
  const opened = useRef(false);
  const previous = useRef<{ first: string; height: number } | null>(null);
  const firstDay = days[0]?.day ?? today;

  // Open at the present. Then keep the reader in place when earlier days
  // appear above.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root === null) return;
    const scroller = root.ownerDocument.documentElement;
    if (!opened.current) {
      opened.current = true;
      root
        .querySelector<HTMLElement>('[data-today="true"]')
        ?.scrollIntoView({ block: "start" });
    } else if (previous.current !== null && previous.current.first > firstDay) {
      root.ownerDocument.defaultView?.scrollBy(
        0,
        scroller.scrollHeight - previous.current.height,
      );
    }
    previous.current = { first: firstDay, height: scroller.scrollHeight };
  }, [days, firstDay]);

  const observe = useCallback(
    (load: (() => void) | undefined) => (button: HTMLButtonElement | null) => {
      if (button === null || load === undefined) return undefined;
      if (typeof IntersectionObserver === "undefined") return undefined;
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) load();
        },
        { rootMargin: "400px 0px" },
      );
      observer.observe(button);
      return () => {
        observer.disconnect();
      };
    },
    [],
  );
  const earlierRef = useMemo(
    () => observe(onLoadEarlier),
    [observe, onLoadEarlier],
  );
  const laterRef = useMemo(() => observe(onLoadLater), [observe, onLoadLater]);

  return (
    <div className="od-calendar-timeline" ref={rootRef}>
      {hasEarlier ? (
        <button
          className="od-calendar-more"
          onClick={onLoadEarlier}
          ref={earlierRef}
          type="button"
        >
          {labels.earlier}
        </button>
      ) : null}
      <ol className="od-calendar-timeline-days">
        {days.map(({ day, items, startsMonth }) => {
          const date = calendarDayDate(day);
          return (
            <li
              className="od-calendar-timeline-day"
              data-empty={items.length === 0}
              data-past={day < today}
              data-today={day === today}
              key={day}
            >
              {startsMonth ? (
                <h2 className="od-calendar-timeline-month">
                  {formats.month.format(date)}
                </h2>
              ) : null}
              <time
                aria-current={day === today ? "date" : undefined}
                aria-label={formats.fullDay.format(date)}
                className="od-calendar-day-head"
                dateTime={day}
              >
                <span className="od-calendar-day-weekday">
                  {formats.weekday.format(date)}
                </span>
                <span className="od-calendar-day-number">{date.getDate()}</span>
              </time>
              <div className="od-calendar-timeline-items">
                {items.length === 0 ? (
                  <span className="od-calendar-timeline-now">
                    {labels.today}
                  </span>
                ) : (
                  items.map((item) => (
                    <CalendarEntry
                      item={item}
                      layout="row"
                      key={item.id}
                      onSelect={onSelect}
                      followUpLabels={labels.followUps}
                      stateLabels={labels.states}
                      time={formats.time.format(new Date(item.start))}
                    />
                  ))
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {hasLater ? (
        <button
          className="od-calendar-more"
          onClick={onLoadLater}
          ref={laterRef}
          type="button"
        >
          {labels.later}
        </button>
      ) : null}
    </div>
  );
}

/**
 * A calendar of entries that go to one or more networks. It has a month
 * view, a week view and a continuous timeline. The host owns the data.
 */
export function CalendarBoard({
  anchor,
  canMove,
  className,
  hasEarlier = false,
  hasLater = false,
  items,
  labels = calendarBoardLabels,
  locale,
  mode,
  now,
  onLoadEarlier,
  onLoadLater,
  onMove,
  onSelect,
  today,
  timeZone,
}: CalendarBoardProps) {
  const formats = useMemo<Formats>(
    () => ({
      time: new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
      hour: new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }),
      fullDay: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      month: new Intl.DateTimeFormat(locale, {
        month: "long",
        year: "numeric",
      }),
    }),
    [locale, timeZone],
  );
  const groups = useMemo(() => groupByDay(items, timeZone), [items, timeZone]);
  const drag = useCalendarDrag({ items, canMove, onMove, now, timeZone });
  return (
    <section
      aria-label={labels.board}
      className={classes("od-calendar", className)}
      data-mode={mode}
      data-dragging={drag.dragging || undefined}
    >
      {mode === "timeline" ? (
        <Timeline
          formats={formats}
          groups={groups}
          hasEarlier={hasEarlier}
          hasLater={hasLater}
          labels={labels}
          onLoadEarlier={onLoadEarlier}
          onLoadLater={onLoadLater}
          onSelect={onSelect}
          today={today}
        />
      ) : (
        <>
          {mode === "week" ? (
            <CalendarWeek
              anchor={anchor}
              drag={drag}
              formats={formats}
              groups={groups}
              labels={labels}
              now={now}
              onSelect={onSelect}
              today={today}
              timeZone={timeZone}
            />
          ) : null}
          <Grid
            anchor={anchor}
            drag={drag}
            formats={formats}
            groups={groups}
            labels={labels}
            mode={mode}
            onSelect={onSelect}
            today={today}
          />
        </>
      )}
    </section>
  );
}
