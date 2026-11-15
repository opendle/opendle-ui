import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { classes } from "./classes.js";

export type ButtonVariant =
  "primary" | "secondary" | "quiet" | "danger" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: ReactNode;
  /** Show the loading sign in place of the icon. The button does not act. */
  readonly loading?: boolean;
  readonly ref?: Ref<HTMLButtonElement>;
  readonly size?: "default" | "small";
  readonly variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  disabled,
  icon,
  loading = false,
  size = "default",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={classes("od-button", `od-button-${variant}`, className)}
      data-loading={loading || undefined}
      data-size={size}
      disabled={disabled === true || loading}
      type={type}
    >
      {loading ? <span aria-hidden="true" className="od-loading-ring" /> : icon}
      {children}
    </button>
  );
}
