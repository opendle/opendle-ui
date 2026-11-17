import { characterCount } from "./characterLength.js";
import { classes } from "./classes.js";

export interface CharacterCountProps {
  /** The text, or a count that the host made. */
  readonly value: string | number;
  /** The limit, or `null` for none. A count above it is invalid. */
  readonly limit: number | null;
  /** A short name for screen readers, for example the network. */
  readonly label?: string;
  readonly className?: string;
}

const countFormat = new Intl.NumberFormat();

/** A count of characters against an optional limit. */
export function CharacterCount({
  className,
  label,
  limit,
  value,
}: CharacterCountProps) {
  const count = typeof value === "number" ? value : characterCount(value);
  const over = limit !== null && count > limit;
  return (
    <span
      className={classes("od-character-count", className)}
      data-invalid={over}
    >
      {label === undefined ? null : (
        <span className="od-visually-hidden">{`${label}: `}</span>
      )}
      {countFormat.format(count)}
      {limit === null ? null : ` / ${countFormat.format(limit)}`}
    </span>
  );
}
