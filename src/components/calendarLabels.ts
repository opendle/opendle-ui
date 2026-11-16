import type { CalendarMode } from "./calendarDates.js";
import type { CalendarItemState } from "./calendarItems.js";
import type { NetworkName } from "./networks.js";

export interface CalendarHeaderLabels {
  readonly previous: string;
  readonly next: string;
  readonly today: string;
  readonly view: string;
  readonly modes: Readonly<Record<CalendarMode, string>>;
}

export const calendarHeaderLabels: CalendarHeaderLabels = {
  previous: "Previous",
  next: "Next",
  today: "Today",
  view: "View",
  modes: { month: "Month", week: "Week", timeline: "Timeline" },
};

export interface PostDetailLabels {
  readonly close: string;
  readonly open: string;
  readonly retry: string;
  readonly play: string;
  readonly channels: string;
  readonly variants: string;
  readonly states: Readonly<Record<CalendarItemState, string>>;
}

export const postDetailLabels: PostDetailLabels = {
  close: "Close",
  open: "Open",
  retry: "Retry",
  play: "Play",
  channels: "Channels",
  variants: "Channel versions",
  states: {
    draft: "draft",
    scheduled: "scheduled",
    publishing: "publishing",
    published: "published",
    failed: "failed",
    cancelled: "cancelled",
  },
};

export interface TagFilterChannel {
  readonly id: string;
  readonly network: NetworkName;
  /** The accessible name, for example the network and the account. */
  readonly label: string;
}

/** The colour key, from 1 to 12, of each tag name. */
export type TagColors = Readonly<Record<string, number>>;

export type TagFilterMatch = "all" | "any";

export interface TagFilterValue {
  /** Selected channel IDs. An empty list selects all channels. */
  readonly channels: readonly string[];
  readonly tags: readonly string[];
  readonly match: TagFilterMatch;
}

export const emptyTagFilter: TagFilterValue = {
  channels: [],
  tags: [],
  match: "all",
};

export interface TagFilterLabels {
  readonly filters: string;
  readonly channels: string;
  readonly tags: string;
  readonly match: string;
  readonly matchAll: string;
  readonly matchAny: string;
}

export const tagFilterLabels: TagFilterLabels = {
  filters: "Filters",
  channels: "Channels",
  tags: "Tags",
  match: "Tag logic",
  matchAll: "AND",
  matchAny: "OR",
};
