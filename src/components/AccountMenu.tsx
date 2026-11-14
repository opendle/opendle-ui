import type { AnchorHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface AccountMenuProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "title"
> {
  readonly href: string;
  /** An `Avatar` element. */
  readonly avatar: ReactNode;
  readonly name: string;
  readonly active?: boolean;
}

/** The signed-in person at the end of the application sidebar. */
export function AccountMenu({
  active = false,
  avatar,
  className,
  name,
  ...props
}: AccountMenuProps) {
  return (
    <a
      {...props}
      aria-current={active ? "page" : undefined}
      className={classes("od-account-menu", className)}
      title={name}
    >
      {avatar}
      <span className="od-navigation-label">{name}</span>
    </a>
  );
}
