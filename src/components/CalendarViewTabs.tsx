import type { CalendarMode } from "./calendarDates.js";
import {
  calendarHeaderLabels,
  type CalendarHeaderLabels,
} from "./calendarLabels.js";
import { Tabs } from "./Tabs.js";

export interface CalendarViewTabsProps {
  /** The prefix of the tab and panel IDs. Give the same value to `TabPanel`. */
  readonly idBase: string;
  readonly value: CalendarMode;
  readonly onChange: (mode: CalendarMode) => void;
  readonly labels?: CalendarHeaderLabels;
  readonly className?: string;
}

const modes: readonly CalendarMode[] = ["month", "week", "timeline"];

/** The month, week and timeline tabs of a calendar, for a `FilterToolbar`. */
export function CalendarViewTabs({
  className,
  idBase,
  labels = calendarHeaderLabels,
  onChange,
  value,
}: CalendarViewTabsProps) {
  return (
    <Tabs<CalendarMode>
      idBase={idBase}
      items={modes.map((mode) => ({ id: mode, label: labels.modes[mode] }))}
      label={labels.view}
      onChange={onChange}
      value={value}
      {...(className === undefined ? {} : { className })}
    />
  );
}
