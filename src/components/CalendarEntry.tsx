import { useRef, type CSSProperties } from "react";

import {
  calendarBoardLabels,
  calendarItemState,
  urgentState,
  type CalendarFollowUpLabels,
  type CalendarItem,
  type CalendarItemState,
} from "./calendarItems.js";
import { classes } from "./classes.js";
import type { CalendarEntryDrag } from "./useCalendarDrag.js";
import { Icon, NetworkIcon, type IconName } from "./Icon.js";

export interface CalendarEntryProps {
  readonly item: CalendarItem;
  /** The time of the entry, already formatted. */
  readonly time: string;
  /** A day before the time, for a list that is not grouped by day. */
  readonly date?: string;
  readonly onSelect: (item: CalendarItem) => void;
  /** Drag behavior supplied by the calendar board. */
  readonly drag?: CalendarEntryDrag | undefined;
  /** `row` puts all parts on one line when the width permits. */
  readonly layout?: "card" | "row";
  readonly stateLabels?: Readonly<Record<CalendarItemState, string>>;
  readonly followUpLabels?: CalendarFollowUpLabels;
  readonly className?: string;
}

interface FollowUpMark {
  readonly kind: "comment" | "like";
  readonly count: number;
  readonly state: CalendarItemState;
}

/** One mark per kind of follow-up, with its count and its most urgent state. */
function followUpMarks(item: CalendarItem): readonly FollowUpMark[] {
  // A cancelled comment or like does not count.
  const states: Record<FollowUpMark["kind"], CalendarItemState[]> = {
    comment: [],
    like: [],
  };
  for (const followUp of item.followUps ?? []) {
    if (followUp.state !== "cancelled")
      states[followUp.kind].push(followUp.state);
  }
  return (["comment", "like"] as const).flatMap((kind) =>
    states[kind].length === 0
      ? []
      : [
          {
            kind,
            count: states[kind].length,
            state: urgentState(states[kind]),
          },
        ],
  );
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
  drag,
  item,
  followUpLabels = calendarBoardLabels.followUps,
  layout = "card",
  onSelect,
  stateLabels = calendarBoardLabels.states,
  time,
}: CalendarEntryProps) {
  const dragged = useRef(false);
  const state = calendarItemState(item);
  const marks = followUpMarks(item);
  const style =
    item.color === undefined
      ? undefined
      : ({ "--od-calendar-item-color": item.color } as CSSProperties);
  return (
    <button
      aria-label={[
        date,
        time,
        item.title,
        stateLabels[state],
        ...marks.map(
          (mark) => `${followUpLabels[mark.kind]}: ${stateLabels[mark.state]}`,
        ),
      ]
        .filter(Boolean)
        .join(", ")}
      className={classes("od-calendar-item", className)}
      data-layout={layout}
      data-state={state}
      draggable={drag === undefined ? undefined : true}
      onDragStart={(event) => {
        if (drag === undefined) return;
        dragged.current = true;
        drag.onStart(event);
      }}
      onDragEnd={() => {
        drag?.onEnd();
        window.setTimeout(() => {
          dragged.current = false;
        }, 0);
      }}
      onClick={() => {
        if (!dragged.current) onSelect(item);
      }}
      style={style}
      type="button"
    >
      <span className="od-calendar-item-bar" />
      <span className="od-calendar-item-main">
        <span className="od-calendar-item-top">
          <span className="od-calendar-item-state" title={stateLabels[state]}>
            <Icon name={stateIcons[state]} size={13} />
          </span>
          <time dateTime={item.start}>
            {date === undefined ? time : `${date}, ${time}`}
          </time>
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
          {marks.map((mark) => (
            <span
              className="od-calendar-item-follow-up"
              data-state={mark.state}
              key={mark.kind}
              title={`${followUpLabels[mark.kind]}: ${stateLabels[mark.state]}`}
            >
              <Icon
                name={mark.kind === "comment" ? "message" : "heart"}
                size={12}
              />
              {mark.count > 1 ? mark.count : null}
            </span>
          ))}
        </span>
        <span className="od-calendar-item-title">
          {item.title}
          {item.summary ? (
            <span className="od-calendar-item-summary">{item.summary}</span>
          ) : null}
        </span>
      </span>
      {item.preview ? (
        <span
          className="od-calendar-item-preview"
          data-video={item.preview.video === true}
        >
          <img alt="" loading="lazy" src={item.preview.src} />
        </span>
      ) : null}
    </button>
  );
}
