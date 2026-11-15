import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface TagChipProps {
  readonly children: ReactNode;
  /** With `onPressedChange`, the chip is a toggle button. */
  readonly pressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  /** The colour key of the tag, from 1 to 12. */
  readonly color?: number | undefined;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly title?: string | undefined;
}

/** A tag label. It is a toggle when the host gives `onPressedChange`. */
export function TagChip({
  children,
  className,
  color,
  disabled = false,
  title,
  onPressedChange,
  pressed = false,
}: TagChipProps) {
  if (onPressedChange === undefined) {
    return (
      <span className={classes("od-tag", className)} data-color={color}>
        {children}
      </span>
    );
  }
  return (
    <button
      aria-pressed={pressed}
      className={classes("od-tag", className)}
      data-color={color}
      disabled={disabled}
      title={title}
      onClick={() => {
        onPressedChange(!pressed);
      }}
      type="button"
    >
      {children}
    </button>
  );
}
