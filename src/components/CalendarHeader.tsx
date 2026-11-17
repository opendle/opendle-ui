import type { ReactNode } from "react";

import { Button } from "./Button.js";
import {
  calendarHeaderLabels,
  type CalendarHeaderLabels,
} from "./calendarLabels.js";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";

export interface CalendarHeaderProps {
  readonly title: ReactNode;
  /** Without these, the header has no period navigation. */
  readonly onPrevious?: () => void;
  readonly onNext?: () => void;
  readonly onToday: () => void;
  /** Page actions at the end of the row, for example a create button. */
  readonly actions?: ReactNode;
  readonly labels?: CalendarHeaderLabels;
  readonly className?: string;
}

/**
 * The page heading of a calendar: the period and its navigation. Put the
 * view switch, `CalendarViewTabs`, in a `FilterToolbar` below it.
 */
export function CalendarHeader({
  actions,
  className,
  labels = calendarHeaderLabels,
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
      {actions ? (
        <div className="od-heading-actions od-calendar-header-actions">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
