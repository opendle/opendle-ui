import { classes } from "./classes.js";

export interface AvatarProps {
  /** The person's name. The first letter shows when there is no picture. */
  readonly name: string;
  readonly src?: string | null;
  readonly size?: "default" | "large";
  readonly className?: string;
}

/** A round picture of a person, with an initial as the fallback. */
export function Avatar({
  className,
  name,
  size = "default",
  src,
}: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={classes("od-avatar", className)}
      data-size={size}
    >
      {src ? (
        <img alt="" src={src} />
      ) : (
        (Array.from(name.trim())[0] ?? "").toUpperCase()
      )}
    </span>
  );
}
