import type { MouseEventHandler } from "react";

export type CapabilityTagTone =
  "neutral" | "blue" | "teal" | "violet" | "amber" | "coral";

/** Hosts supply capability names, tones, and filter state. */
export interface CapabilityTagProps {
  readonly label: string;
  readonly direction?: "input" | "output";
  readonly tone?: CapabilityTagTone;
  readonly description?: string;
  readonly pressed?: boolean;
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
}

export function CapabilityTag({
  label,
  direction,
  tone = "neutral",
  description,
  pressed,
  onClick,
}: CapabilityTagProps) {
  const directionLabel = direction
    ? `${direction === "input" ? "Input" : "Output"} ${label}`
    : label;
  const accessibleLabel = description ?? directionLabel;
  const directionIcon = direction ? (
    <svg
      aria-hidden="true"
      className="od-capability-tag-direction"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
    >
      <path d="M2 8h11M9 4l4 4-4 4" />
    </svg>
  ) : null;
  const content = (
    <>
      {direction === "input" ? directionIcon : null}
      <span>{label}</span>
      {direction === "output" ? directionIcon : null}
      {description && !direction && !onClick ? (
        <span aria-hidden="true">ⓘ</span>
      ) : null}
    </>
  );
  const attributes = {
    "aria-label": accessibleLabel,
    className: "od-capability-tag",
    "data-direction": direction,
    "data-tone": tone,
    title: description ?? (direction ? directionLabel : undefined),
  };
  return onClick ? (
    <button
      {...attributes}
      aria-pressed={pressed ?? false}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  ) : (
    <span {...attributes}>{content}</span>
  );
}
