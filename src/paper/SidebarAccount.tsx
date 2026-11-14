import type { AnchorHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface SidebarAccountProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children"
> {
  readonly href: string;
  readonly avatar: ReactNode;
  readonly name: string;
  readonly active?: boolean;
}

/** The signed-in person at the end of the sidebar. */
export function SidebarAccount({
  active = false,
  avatar,
  className,
  name,
  ...props
}: SidebarAccountProps) {
  return (
    <a
      {...props}
      aria-current={active ? "page" : undefined}
      className={classes("pp-sidebar-account", className)}
      title={name}
    >
      {avatar}
      <span className="pp-sidebar-label">{name}</span>
    </a>
  );
}
