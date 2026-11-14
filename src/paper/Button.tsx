import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classes } from "./classes.js";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: ReactNode;
  readonly size?: "default" | "small";
  readonly variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  icon,
  size = "default",
  type = "button",
  variant = "secondary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={classes("pp-button", className)}
      data-size={size}
      data-variant={variant}
      type={type}
    >
      {icon}
      {children}
    </button>
  );
}

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> {
  readonly icon: ReactNode;
  /** The accessible name. It is also the tooltip. */
  readonly label: string;
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
      aria-label={label}
      className={classes("pp-icon-button", className)}
      data-tone={tone}
      title={label}
      type={type}
    >
      {icon}
    </button>
  );
}
