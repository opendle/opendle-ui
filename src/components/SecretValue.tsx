import { useCallback, useState } from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";

export interface SecretValueProps {
  readonly value: string;
  /** The accessible name of the secret value. */
  readonly label: string;
  readonly copyLabel: string;
  readonly copiedLabel: string;
  readonly className?: string;
}

/** A secret that shows one time, with a copy button. */
export function SecretValue({
  className,
  copiedLabel,
  copyLabel,
  label,
  value,
}: SecretValueProps) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }, [value]);
  return (
    <div className={classes("od-secret-value", className)}>
      <code aria-label={label}>{value}</code>
      <IconButton
        icon={<Icon name={copied ? "check" : "copy"} />}
        label={copied ? copiedLabel : copyLabel}
        onClick={() => void copy()}
      />
      <span aria-live="polite" className="od-visually-hidden">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}
