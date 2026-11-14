import type { HTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly children?: ReactNode;
  /** Add the standard inner padding. */
  readonly padded?: boolean;
}

/** A bordered surface. */
export function Card({
  children,
  className,
  padded = false,
  ...props
}: CardProps) {
  return (
    <section
      {...props}
      className={classes("od-card", className)}
      data-padded={padded}
    >
      {children}
    </section>
  );
}
