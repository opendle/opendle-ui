import { classes } from "./classes.js";
import { CopyButton } from "./CopyButton.js";

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
  return (
    <div className={classes("od-secret-value", className)}>
      <code aria-label={label}>{value}</code>
      <CopyButton
        copiedLabel={copiedLabel}
        copyLabel={copyLabel}
        value={value}
      />
    </div>
  );
}
