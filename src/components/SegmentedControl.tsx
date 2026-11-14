import type { ReactNode } from "react";

import { classes } from "./classes.js";

export interface SegmentedOption<Value extends string> {
  readonly value: Value;
  readonly label: ReactNode;
}

export interface SegmentedControlProps<Value extends string> {
  /** The accessible name of the group. */
  readonly label: string;
  readonly options: readonly SegmentedOption<Value>[];
  readonly value: Value;
  readonly onChange: (value: Value) => void;
  readonly size?: "default" | "small";
  readonly className?: string;
}

/** A small set of exclusive choices that shows all of them. */
export function SegmentedControl<Value extends string>({
  className,
  label,
  onChange,
  options,
  size = "default",
  value,
}: SegmentedControlProps<Value>) {
  return (
    <fieldset
      aria-label={label}
      className={classes("od-segmented", className)}
      data-size={size}
    >
      {options.map((option) => (
        <button
          aria-pressed={option.value === value}
          key={option.value}
          onClick={() => {
            if (option.value !== value) onChange(option.value);
          }}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}
