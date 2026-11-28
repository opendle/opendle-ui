import { useId, type ButtonHTMLAttributes, type ReactNode } from "react";

import { classes } from "./classes.js";

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  readonly icon: ReactNode;
  /** The accessible name. It is also the tooltip. */
  readonly label?: string;
  /**
   * Why the action is not available. The button is disabled, the reason is
   * its tooltip and its accessible description, and the pointer can show it.
   */
  readonly disabledReason?: string;
  readonly tone?: "default" | "danger";
}

export function IconButton({
  className,
  disabled,
  disabledReason,
  icon,
  label,
  tone = "default",
  type = "button",
  ...props
}: IconButtonProps) {
  const reasonId = useId();
  const reason =
    disabledReason === undefined || disabledReason === ""
      ? null
      : disabledReason;
  return (
    <button
      {...props}
      {...(label === undefined ? {} : { "aria-label": label, title: label })}
      {...(reason === null
        ? { disabled }
        : {
            "aria-describedby": reasonId,
            "data-reason": "",
            disabled: true,
            title: reason,
          })}
      className={classes("od-icon-button", className)}
      data-tone={tone}
      type={type}
    >
      {icon}
      {reason === null ? null : (
        <span hidden id={reasonId}>
          {reason}
        </span>
      )}
    </button>
  );
}
