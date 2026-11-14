import type { ReactNode } from "react";

import { Button } from "./Button.js";
import type { CalendarMode } from "./calendarDates.js";
import {
  calendarHeaderLabels,
  type CalendarHeaderLabels,
} from "./calendarLabels.js";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { SegmentedControl } from "./SegmentedControl.js";

export interface CalendarHeaderProps {
  readonly title: ReactNode;
  readonly mode: CalendarMode;
  readonly onModeChange: (mode: CalendarMode) => void;
  /** Without these, the header has no period navigation. */
  readonly onPrevious?: () => void;
  readonly onNext?: () => void;
  readonly onToday: () => void;
  readonly labels?: CalendarHeaderLabels;
  readonly className?: string;
}

const modes: readonly CalendarMode[] = ["month", "week", "timeline"];

/** The page heading of a calendar: period, navigation and the view switch. */
export function CalendarHeader({
  className,
  labels = calendarHeaderLabels,
  mode,
  onModeChange,
  onNext,
  onPrevious,
  onToday,
  title,
}: CalendarHeaderProps) {
  return (
    <header className={classes("od-calendar-header", className)}>
      <h1>{title}</h1>
      <div className="od-calendar-header-navigation">
        {onPrevious === undefined ? null : (
          <IconButton
            icon={<Icon name="chevron-left" />}
            label={labels.previous}
            onClick={onPrevious}
          />
        )}
        <Button onClick={onToday} variant="secondary">
          {labels.today}
        </Button>
        {onNext === undefined ? null : (
          <IconButton
            icon={<Icon name="chevron-right" />}
            label={labels.next}
            onClick={onNext}
          />
        )}
      </div>
      <SegmentedControl
        className="od-calendar-header-views"
        label={labels.view}
        onChange={onModeChange}
        options={modes.map((value) => ({ value, label: labels.modes[value] }))}
        value={mode}
      />
    </header>
  );
}
