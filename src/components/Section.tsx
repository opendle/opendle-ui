import { useId, type ReactNode } from "react";

import { classes } from "./classes.js";

export interface SectionProps {
  readonly title: ReactNode;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

/** A titled part of a page. */
export function Section({ actions, children, className, title }: SectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={classes("od-section", className)}
    >
      <div className="od-section-heading">
        <h2 id={headingId}>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
