import { useCallback, useState } from "react";

import { IconButton } from "./Button.js";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";

export interface SecretRevealProps {
  readonly value: string;
  /** The accessible name of the secret value. */
  readonly label: string;
  readonly copyLabel: string;
  readonly copiedLabel: string;
  readonly className?: string;
}

/** A secret that shows one time, with a copy button. */
export function SecretReveal({
  className,
  copiedLabel,
  copyLabel,
  label,
  value,
}: SecretRevealProps) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }, [value]);
  return (
    <div className={classes("pp-secret", className)}>
      <code aria-label={label}>{value}</code>
      <IconButton
        icon={<Icon name={copied ? "check" : "copy"} />}
        label={copied ? copiedLabel : copyLabel}
        onClick={() => void copy()}
      />
      <span aria-live="polite" className="pp-visually-hidden">
        {copied ? copiedLabel : ""}
      </span>
    </div>
  );
}
