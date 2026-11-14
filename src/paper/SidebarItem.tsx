import type { AnchorHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface SidebarItemProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> {
  readonly href: string;
  readonly icon: ReactNode;
  readonly label: string;
  readonly active?: boolean;
  /** A count badge, for example unread messages. Zero shows no badge. */
  readonly count?: number;
}

export function SidebarItem({
  active = false,
  className,
  count = 0,
  icon,
  label,
  ...props
}: SidebarItemProps) {
  return (
    <a
      {...props}
      aria-current={active ? "page" : undefined}
      className={classes("pp-sidebar-item", className)}
      title={label}
    >
      {icon}
      <span className="pp-sidebar-label">{label}</span>
      {count > 0 ? <span className="pp-count">{count}</span> : null}
    </a>
  );
}
