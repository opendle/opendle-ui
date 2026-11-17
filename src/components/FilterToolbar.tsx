import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface FilterToolbarProps {
  /** The tabs of the view, for example `Tabs`, at the start of the row. */
  readonly start?: ReactNode;
  /** The filters of the view, for example `TagFilterBar`. They follow the tabs. */
  readonly children?: ReactNode;
  /** A `SearchField`, always at the end of the row, in a compact width. */
  readonly end?: ReactNode;
  readonly className?: string;
}

const isEmpty = (node: ReactNode) => node === undefined || node === null;

/**
 * The one toolbar of a list view: tabs, then filters, then search. When the
 * row has no room, the tabs stay above the content and the filters and the
 * search go on the line above them. A narrow toolbar puts each part on its
 * own line.
 */
export function FilterToolbar({
  children,
  className,
  end,
  start,
}: FilterToolbarProps) {
  const hasTabs = !isEmpty(start);
  return (
    <div
      className={classes("od-filter-toolbar", className)}
      data-tabs={hasTabs}
    >
      <div className="od-filter-toolbar-row">
        {hasTabs ? <div className="od-filter-toolbar-tabs">{start}</div> : null}
        <div className="od-filter-toolbar-controls">
          <div className="od-filter-toolbar-filters">{children}</div>
          {isEmpty(end) ? null : (
            <div className="od-filter-toolbar-search">{end}</div>
          )}
        </div>
      </div>
    </div>
  );
}
