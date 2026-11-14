import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { classes } from "./classes.js";

export type ButtonVariant =
  "primary" | "secondary" | "quiet" | "danger" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: ReactNode;
  readonly ref?: Ref<HTMLButtonElement>;
  readonly size?: "default" | "small";
  readonly variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  icon,
  size = "default",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={classes("od-button", `od-button-${variant}`, className)}
      data-size={size}
      type={type}
    >
      {icon}
      {children}
    </button>
  );
}
