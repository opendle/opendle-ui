import type { CSSProperties, DragEvent, ReactNode } from "react";

export type CalendarMode = "week" | "month" | "timeline";
export type CalendarEventState = "planned" | "completed";

export interface CalendarEvent {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly date: string;
  readonly start: string;
  readonly end: string;
  readonly kind: string;
  readonly state: CalendarEventState;
  readonly channel?: string;
  readonly editable: boolean;
}

export interface CalendarBoardProps {
  readonly mode: CalendarMode;
  readonly items: readonly CalendarEvent[];
  readonly weekDates: readonly string[];
  readonly weekHours: readonly string[];
  readonly today: string;
  readonly selectedId: string | null;
  readonly draggedId: string | null;
  readonly dropDate: string | null;
  readonly onSelect: (item: CalendarEvent) => void;
  readonly onDragStart: (
    event: DragEvent<HTMLElement>,
    item: CalendarEvent,
  ) => void;
  readonly onDragEnd: () => void;
  readonly onAllowDrop: (event: DragEvent<HTMLElement>, date: string) => void;
  readonly onClearDrop: (event: DragEvent<HTMLElement>) => void;
  readonly onMove: (event: DragEvent<HTMLElement>, date: string) => void;
  readonly currentTimeLabel?: string;
  readonly renderChannel?: (channel: string) => ReactNode;
}

const monthDayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const monthLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  timeZone: "UTC",
});

function parseDate(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

function eventDuration(item: CalendarEvent) {
  const [startHour = 0, startMinute = 0] = item.start.split(":").map(Number);
  const [endHour = 0, endMinute = 0] = item.end.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function eventStyle(item: CalendarEvent): CSSProperties {
  const [hour = 0, minute = 0] = item.start.split(":").map(Number);
  const [endHour = 0, endMinute = 0] = item.end.split(":").map(Number);
  return {
    "--calendar-event-top": `${String(Math.max(0, hour * 60 + minute - 8 * 60))}px`,
    "--calendar-event-height": `${String(Math.max(38, endHour * 60 + endMinute - (hour * 60 + minute)))}px`,
  } as CSSProperties;
}

function monthDays(year: number, monthIndex: number) {
  const monthStart = new Date(Date.UTC(year, monthIndex, 1, 12));
  const mondayOffset = (monthStart.getUTCDay() + 6) % 7;
  const gridStart = new Date(monthStart);
  gridStart.setUTCDate(monthStart.getUTCDate() - mondayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + index);
    return {
      date: date.toISOString().slice(0, 10),
      day: date.getUTCDate(),
      inMonth: date.getUTCMonth() === monthIndex,
    };
  });
}

function ChannelMark({
  channel,
  renderChannel,
}: {
  channel: string;
  renderChannel: ((channel: string) => ReactNode) | undefined;
}) {
  return (
    renderChannel?.(channel) ?? (
      <span
        className="calendar-event-channel"
        data-calendar-network={channel.toLowerCase()}
        title={`${channel} channel`}
        aria-hidden="true"
      >
        {channel.slice(0, 1).toUpperCase()}
      </span>
    )
  );
}

function EventButton({
  item,
  compact,
  selected,
  dragging,
  onSelect,
  onDragStart,
  onDragEnd,
  renderChannel,
}: {
  item: CalendarEvent;
  compact?: boolean;
  selected: boolean;
  dragging: boolean;
  onSelect: (item: CalendarEvent) => void;
  onDragStart: (event: DragEvent<HTMLElement>, item: CalendarEvent) => void;
  onDragEnd: () => void;
  renderChannel: ((channel: string) => ReactNode) | undefined;
}) {
  const singleLine = !compact && eventDuration(item) <= 45;
  const itemLabel = `${item.channel ? `${item.channel}, ` : ""}${item.title}, ${item.start} to ${item.end}, ${item.state}`;
  const classes = [
    "calendar-event",
    `calendar-event-${item.kind}`,
    `calendar-event-${item.state}`,
    compact ? "calendar-event-month-chip" : "",
    singleLine ? "calendar-event-short" : "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button
      className={classes}
      data-calendar-channel={item.channel?.toLowerCase()}
      data-calendar-layout={
        compact ? "month-chip" : singleLine ? "single-line" : "timed"
      }
      data-selected={selected}
      data-dragging={dragging}
      draggable={item.editable}
      style={compact ? undefined : eventStyle(item)}
      title={`${item.start} · ${item.title}`}
      type="button"
      aria-label={itemLabel}
      onClick={() => {
        onSelect(item);
      }}
      onDragStart={(event) => {
        onDragStart(event, item);
      }}
      onDragEnd={onDragEnd}
    >
      {compact ? (
        <span className="calendar-event-compact-line">
          {item.channel ? (
            <ChannelMark channel={item.channel} renderChannel={renderChannel} />
          ) : null}
          <strong>{item.title}</strong>
        </span>
      ) : singleLine ? (
        <span className="calendar-event-single-line">
          <span className="calendar-event-time">{item.start}</span>
          {item.channel ? (
            <ChannelMark channel={item.channel} renderChannel={renderChannel} />
          ) : null}
          <strong>{item.title}</strong>
        </span>
      ) : (
        <>
          <span className="calendar-event-time">{item.start}</span>
          <strong>{item.title}</strong>
          <span className="calendar-event-meta">
            {item.kind === "agent-stage" ? (
              "Agent stage"
            ) : item.channel ? (
              <ChannelMark
                channel={item.channel}
                renderChannel={renderChannel}
              />
            ) : (
              item.kind.replace("-", " ")
            )}
          </span>
        </>
      )}
      {item.editable ? (
        <span className="calendar-event-grip" aria-hidden="true">
          ⋮
        </span>
      ) : (
        <span className="calendar-event-check" aria-hidden="true">
          ✓
        </span>
      )}
    </button>
  );
}

export function CalendarBoard({
  mode,
  items,
  weekDates,
  weekHours,
  today,
  selectedId,
  draggedId,
  dropDate,
  onSelect,
  onDragStart,
  onDragEnd,
  onAllowDrop,
  onClearDrop,
  onMove,
  currentTimeLabel,
  renderChannel,
}: CalendarBoardProps) {
  if (mode === "timeline") {
    const sortedItems = items
      .slice()
      .sort((a, b) =>
        `${a.date}T${a.start}`.localeCompare(`${b.date}T${b.start}`),
      );
    return (
      <div
        className="calendar-timeline"
        aria-label="Canonical activity timeline"
      >
        {sortedItems.map((item) => (
          <button
            type="button"
            key={item.id}
            data-selected={selectedId === item.id}
            onClick={() => {
              onSelect(item);
            }}
          >
            <time dateTime={`${item.date}T${item.start}:00Z`}>
              {item.date}
              <span>{item.start} UTC</span>
            </time>
            <i aria-hidden="true" />
            <span>
              <small>
                {item.kind.replace("-", " ")} · {item.state}
              </small>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </span>
            {item.channel ? (
              <ChannelMark
                channel={item.channel}
                renderChannel={renderChannel}
              />
            ) : null}
          </button>
        ))}
      </div>
    );
  }
  if (mode === "month") {
    const monthDate = parseDate(today);
    const monthYear = monthDate.getUTCFullYear();
    const monthIndex = monthDate.getUTCMonth();
    const days = monthDays(monthYear, monthIndex);
    const monthLabel = monthLabelFormatter.format(monthDate);
    return (
      <div
        className="calendar-month"
        data-calendar-week-count="6"
        aria-label={`${monthLabel} month view`}
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div className="calendar-month-weekday" key={day}>
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dayItems = items
            .filter((item) => item.date === day.date)
            .sort((a, b) => a.start.localeCompare(b.start));
          const past = day.date < today;
          return (
            <div
              className="calendar-month-day"
              data-calendar-week={Math.floor(index / 7) + 1}
              data-drop-active={dropDate === day.date}
              data-calendar-event-count={dayItems.length}
              data-in-month={day.inMonth}
              data-past={past}
              data-today={day.date === today}
              key={day.date}
              aria-label={`${monthDayFormatter.format(parseDate(day.date))}, ${String(dayItems.length)} ${dayItems.length === 1 ? "event" : "events"}`}
              onDragEnter={(event) => {
                onAllowDrop(event, day.date);
              }}
              onDragOver={(event) => {
                onAllowDrop(event, day.date);
              }}
              onDragLeave={onClearDrop}
              onDrop={(event) => {
                onMove(event, day.date);
              }}
            >
              <div className="calendar-month-date">
                <span>{day.day}</span>
                {day.date === today ? <small>Today</small> : null}
                {past && dayItems.length ? (
                  <span aria-label="Read-only">🔒</span>
                ) : null}
              </div>
              <div className="calendar-month-events">
                {dayItems.map((item) => (
                  <EventButton
                    compact
                    item={item}
                    selected={selectedId === item.id}
                    dragging={draggedId === item.id}
                    key={item.id}
                    onSelect={onSelect}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    renderChannel={renderChannel}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <div className="calendar-week-scroll">
      <div className="calendar-week" aria-label="Calendar week">
        <div className="calendar-week-corner" />
        {weekDates.map((date) => (
          <div
            className="calendar-day-heading"
            data-today={date === today}
            key={date}
          >
            <span>{weekdayFormatter.format(parseDate(date))}</span>
            <strong>{parseDate(date).getUTCDate()}</strong>
            {date === today ? <small>Today</small> : null}
          </div>
        ))}
        <div className="calendar-time-axis" aria-hidden="true">
          {weekHours.map((hour) => (
            <span key={hour}>{hour}</span>
          ))}
        </div>
        {weekDates.map((date) => {
          const dayItems = items
            .filter((item) => item.date === date)
            .sort((a, b) => a.start.localeCompare(b.start));
          const past = date < today;
          return (
            <div
              className="calendar-day-column"
              data-drop-active={dropDate === date}
              data-past={past}
              data-today={date === today}
              key={date}
              onDragEnter={(event) => {
                onAllowDrop(event, date);
              }}
              onDragOver={(event) => {
                onAllowDrop(event, date);
              }}
              onDragLeave={onClearDrop}
              onDrop={(event) => {
                onMove(event, date);
              }}
            >
              <div className="calendar-hour-lines" aria-hidden="true">
                {weekHours.map((hour) => (
                  <i key={hour} />
                ))}
              </div>
              {date === today ? (
                <div
                  className="calendar-now-line"
                  aria-label={`Current time${currentTimeLabel ? `, ${currentTimeLabel}` : ""}`}
                >
                  <span>{currentTimeLabel ?? "Now"}</span>
                </div>
              ) : null}
              {dayItems.map((item) => (
                <EventButton
                  item={item}
                  selected={selectedId === item.id}
                  dragging={draggedId === item.id}
                  key={item.id}
                  onSelect={onSelect}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  renderChannel={renderChannel}
                />
              ))}
              {past ? (
                <span className="calendar-past-label">🔒 Read-only</span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
