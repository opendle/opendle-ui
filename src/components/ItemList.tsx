import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface ItemListProps {
  readonly children: ReactNode;
  /** Shown in place of the list when it has no rows. */
  readonly empty?: ReactNode;
  readonly className?: string;
}

/** A list of `ItemRow` elements with hairline separators. */
export function ItemList({ children, className, empty }: ItemListProps) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  if (!hasRows && empty !== undefined) {
    return <p className="od-list-empty">{empty}</p>;
  }
  return <ul className={classes("od-list", className)}>{children}</ul>;
}
