import { classes } from "./classes.js";

export interface LoadingIndicatorProps {
  /** The accessible name, for example "Loading". */
  readonly label: string;
  readonly size?: "small" | "default";
  /** Take the width of the container and center in a tall area. */
  readonly block?: boolean;
  readonly className?: string;
}

/**
 * The one sign that something loads. It turns; with reduced motion it fades
 * in and out and does not move.
 */
export function LoadingIndicator({
  block = false,
  className,
  label,
  size = "default",
}: LoadingIndicatorProps) {
  return (
    <output
      aria-label={label}
      className={classes("od-loading", className)}
      data-block={block}
      data-size={size}
    >
      <span className="od-loading-ring" />
    </output>
  );
}
