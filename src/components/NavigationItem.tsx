import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface NavigationItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "title"
> {
  readonly icon: ReactNode;
  readonly label: string;
  readonly active?: boolean;
  /** A count badge, for example unread messages. Zero shows no badge. */
  readonly count?: number;
}

/** One destination of the application sidebar, as a button. */
export function NavigationItem({
  active = false,
  className,
  count = 0,
  icon,
  label,
  type = "button",
  ...props
}: NavigationItemProps) {
  return (
    <button
      {...props}
      aria-current={active ? "page" : undefined}
      className={classes("od-navigation-item", className)}
      title={label}
      type={type}
    >
      {icon}
      <span className="od-navigation-label">{label}</span>
      {count > 0 ? <span className="od-count">{count}</span> : null}
    </button>
  );
}
