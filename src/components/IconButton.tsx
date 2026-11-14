import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  readonly icon: ReactNode;
  /** The accessible name. It is also the tooltip. */
  readonly label?: string;
  readonly tone?: "default" | "danger";
}

export function IconButton({
  className,
  icon,
  label,
  tone = "default",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      {...(label === undefined ? {} : { "aria-label": label, title: label })}
      className={classes("od-icon-button", className)}
      data-tone={tone}
      type={type}
    >
      {icon}
    </button>
  );
}
