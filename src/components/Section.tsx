import { useId, type ReactNode } from "react";

import { classes } from "./classes.js";

export interface SectionProps {
  readonly title: ReactNode;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
  /** A fragment target, for example `notifications` for `#notifications`. */
  readonly id?: string;
}

/** A titled part of a page. */
export function Section({
  actions,
  children,
  className,
  id,
  title,
}: SectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={classes("od-section", className)}
      id={id}
    >
      <div className="od-section-heading">
        <h2 id={headingId}>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
