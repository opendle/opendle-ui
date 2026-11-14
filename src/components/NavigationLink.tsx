import type { AnchorHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface NavigationLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "title"
> {
  readonly icon: ReactNode;
  readonly label: string;
  readonly active?: boolean;
  /** A count badge, for example unread messages. Zero shows no badge. */
  readonly count?: number;
}

/** One destination of the application sidebar, as a link. */
export function NavigationLink({
  active = false,
  className,
  count = 0,
  icon,
  label,
  ...props
}: NavigationLinkProps) {
  return (
    <a
      {...props}
      aria-current={active ? "page" : undefined}
      className={classes("od-navigation-item", className)}
      title={label}
    >
      {icon}
      <span className="od-navigation-label">{label}</span>
      {count > 0 ? <span className="od-count">{count}</span> : null}
    </a>
  );
}
