import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface TagChipProps {
  readonly children: ReactNode;
  /** With `onPressedChange`, the chip is a toggle button. */
  readonly pressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly className?: string;
}

/** A tag label. It is a toggle when the host gives `onPressedChange`. */
export function TagChip({
  children,
  className,
  onPressedChange,
  pressed = false,
}: TagChipProps) {
  if (onPressedChange === undefined) {
    return <span className={classes("pp-tag", className)}>{children}</span>;
  }
  return (
    <button
      aria-pressed={pressed}
      className={classes("pp-tag", className)}
      onClick={() => {
        onPressedChange(!pressed);
      }}
      type="button"
    >
      {children}
    </button>
  );
}
