import type { ReactNode } from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";

export interface TagChipProps {
  readonly children: ReactNode;
  /** With `onPressedChange`, the chip is a toggle button. */
  readonly pressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  /** The colour key of the tag, from 1 to 12. */
  readonly color?: number | undefined;
  readonly className?: string;
  readonly disabled?: boolean;
  /**
   * The function of the toggle is not available, for example on a network
   * that does not support it. The chip is disabled and shows a blocked mark.
   * Give the reason in `title`.
   */
  readonly unavailable?: boolean;
  readonly title?: string | undefined;
}

/**
 * A tag label. It is a toggle when the host gives `onPressedChange`: on is
 * filled, off has an outline, and an unavailable function has a flat muted
 * fill and a blocked mark.
 */
export function TagChip({
  children,
  className,
  color,
  disabled = false,
  title,
  onPressedChange,
  pressed = false,
  unavailable = false,
}: TagChipProps) {
  if (onPressedChange === undefined) {
    return (
      <span
        className={classes("od-tag", className)}
        data-color={color}
        title={title}
      >
        {children}
      </span>
    );
  }
  return (
    <button
      aria-pressed={pressed}
      className={classes("od-tag", className)}
      data-color={color}
      data-unavailable={unavailable || undefined}
      disabled={disabled || unavailable}
      title={title}
      onClick={() => {
        onPressedChange(!pressed);
      }}
      type="button"
    >
      {unavailable ? <Icon name="blocked" size={12} /> : null}
      {children}
    </button>
  );
}
