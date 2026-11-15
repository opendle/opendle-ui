import type { NetworkName } from "./networks.js";

export type CalendarItemState =
  "scheduled" | "publishing" | "published" | "failed" | "cancelled";

export interface CalendarItemTarget {
  readonly id: string;
  readonly network: NetworkName;
  readonly state: CalendarItemState;
}

/** One entry of the calendar. It can go to several networks. */
/** One entry of the calendar. It can go to several networks. */
export interface CalendarItem {
  readonly id: string;
  /** The ISO 8601 instant of the entry. */
  readonly start: string;
  readonly title: string;
  /** A small square picture of the media. A video gets a play mark. */
  readonly preview?: {
    readonly src: string;
    readonly video?: boolean;
  };
  /** A CSS colour for the bar at the start of the entry. */
  readonly color?: string;
  /** A short line of facts, for example "18.4K views · 37 comments". */
  readonly summary?: string;
  readonly targets: readonly CalendarItemTarget[];
}

export interface CalendarBoardLabels {
  readonly board: string;
  readonly today: string;
  readonly empty: string;
  readonly earlier: string;
  readonly later: string;
  readonly time: string;
  readonly states: Readonly<Record<CalendarItemState, string>>;
}

export const calendarBoardLabels: CalendarBoardLabels = {
  board: "Calendar",
  today: "Today",
  empty: "No posts",
  earlier: "Earlier",
  later: "Later",
  time: "Time",
  states: {
    scheduled: "Scheduled",
    publishing: "Publishing",
    published: "Published",
    failed: "Failed",
    cancelled: "Cancelled",
  },
};

const statePriority: readonly CalendarItemState[] = [
  "failed",
  "publishing",
  "scheduled",
  "published",
  "cancelled",
];

/** The state of an entry: the most urgent state of its networks. */
export function calendarItemState(item: CalendarItem): CalendarItemState {
  return (
    statePriority.find((state) =>
      item.targets.some((target) => target.state === state),
    ) ?? "scheduled"
  );
}
