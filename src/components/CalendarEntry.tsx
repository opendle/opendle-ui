import type { CSSProperties } from "react";

import {
  calendarBoardLabels,
  calendarItemState,
  type CalendarItem,
  type CalendarItemState,
} from "./calendarItems.js";
import { classes } from "./classes.js";
import { Icon, NetworkIcon, type IconName } from "./Icon.js";

export interface CalendarEntryProps {
  readonly item: CalendarItem;
  /** The time of the entry, already formatted. */
  readonly time: string;
  /** A day before the time, for a list that is not grouped by day. */
  readonly date?: string;
  readonly onSelect: (item: CalendarItem) => void;
  /** `row` puts all parts on one line when the width permits. */
  readonly layout?: "card" | "row";
  readonly stateLabels?: Readonly<Record<CalendarItemState, string>>;
  readonly className?: string;
}

const stateIcons: Record<CalendarItemState, IconName> = {
  scheduled: "clock",
  publishing: "retry",
  published: "check",
  failed: "alert",
  cancelled: "close",
};

/** One entry of a calendar or of a list of posts, with its network badges. */
export function CalendarEntry({
  className,
  date,
  item,
  layout = "card",
  onSelect,
  stateLabels = calendarBoardLabels.states,
  time,
}: CalendarEntryProps) {
  const state = calendarItemState(item);
  const style =
    item.color === undefined
      ? undefined
      : ({ "--od-calendar-item-color": item.color } as CSSProperties);
  return (
    <button
      aria-label={[date, time, item.kind, item.title, stateLabels[state]]
        .filter(Boolean)
        .join(", ")}
      className={classes("od-calendar-item", className)}
      data-layout={layout}
      data-state={state}
      onClick={() => {
        onSelect(item);
      }}
      style={style}
      type="button"
    >
      <span className="od-calendar-item-bar" />
      <span className="od-calendar-item-top">
        <time dateTime={item.start}>
          {date === undefined ? time : `${date}, ${time}`}
        </time>
        {item.kind ? (
          <span className="od-calendar-item-kind">{item.kind}</span>
        ) : null}
        <span className="od-calendar-item-state" title={stateLabels[state]}>
          <Icon name={stateIcons[state]} size={13} />
        </span>
      </span>
      <span className="od-calendar-item-title">
        {item.title}
        {item.summary ? (
          <span className="od-calendar-item-summary">{item.summary}</span>
        ) : null}
      </span>
      <span className="od-calendar-item-networks">
        {item.targets.map((target) => (
          <NetworkIcon
            badge
            className="od-calendar-item-network"
            data-state={target.state}
            key={target.id}
            network={target.network}
          />
        ))}
      </span>
    </button>
  );
}
