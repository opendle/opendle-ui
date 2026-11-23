import type { ReactNode } from "react";

import { classes } from "./classes.js";
import { SwitchControl } from "./FormControls.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";

export interface InheritedSwitchControlProps {
  readonly className?: string;
  readonly disabled?: boolean;
  /** The value that applies while `value` is null. */
  readonly inherited: boolean;
  /** The accessible name of the switch. */
  readonly label: ReactNode;
  /** The new value: a boolean to override, or null to inherit again. */
  readonly onChange: (value: boolean | null) => void;
  readonly overrideLabel?: string;
  readonly resetLabel?: string;
  /** The own value, or null when the inherited value applies. */
  readonly value: boolean | null;
}

/**
 * A switch that can inherit its value. While it inherits, it shows the
 * inherited value dimmed and an edit button that starts an override with
 * that value. An override shows a normal switch and a reset button.
 */
export function InheritedSwitchControl({
  className,
  disabled = false,
  inherited,
  label,
  onChange,
  overrideLabel = "Override",
  resetLabel = "Use the inherited value",
  value,
}: InheritedSwitchControlProps) {
  const inherits = value === null;
  return (
    <span
      className={classes("od-inherited-switch", className)}
      data-inherited={inherits}
    >
      <SwitchControl
        checked={value ?? inherited}
        disabled={disabled || inherits}
        label={label}
        onChange={(event) => {
          onChange(event.currentTarget.checked);
        }}
      />
      <IconButton
        disabled={disabled}
        icon={<Icon name={inherits ? "edit" : "undo"} size={16} />}
        label={inherits ? overrideLabel : resetLabel}
        onClick={() => {
          onChange(inherits ? inherited : null);
        }}
      />
    </span>
  );
}
