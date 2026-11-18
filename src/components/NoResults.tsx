import type { ElementType, HTMLAttributes, ReactNode } from "react";

export interface NoResultsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** The main line, for example `No results for “song”`. */
  readonly title: ReactNode;
  readonly actions?: ReactNode;
  readonly headingLevel?: "h2" | "h3";
}

/** A puzzled magnifier over empty result cards. It follows the theme colours. */
function NoResultsPicture() {
  return (
    <svg
      aria-hidden="true"
      className="od-no-results-picture"
      focusable="false"
      viewBox="0 0 160 124"
    >
      <rect
        className="od-no-results-card od-no-results-card-back"
        height="62"
        rx="11"
        transform="rotate(-7 78 52)"
        width="84"
        x="36"
        y="20"
      />
      <rect
        className="od-no-results-card"
        height="64"
        rx="11"
        width="88"
        x="22"
        y="32"
      />
      <circle className="od-no-results-line" cx="38" cy="50" r="6" />
      <rect
        className="od-no-results-line"
        height="6"
        rx="3"
        width="44"
        x="50"
        y="44"
      />
      <rect
        className="od-no-results-line"
        height="6"
        rx="3"
        width="30"
        x="50"
        y="54"
      />
      <rect
        className="od-no-results-line"
        height="6"
        rx="3"
        width="66"
        x="32"
        y="70"
      />
      <rect
        className="od-no-results-line"
        height="6"
        rx="3"
        width="48"
        x="32"
        y="80"
      />
      <path className="od-no-results-handle" d="M123 89 139 105" />
      <circle className="od-no-results-lens" cx="108" cy="74" r="21" />
      <circle className="od-no-results-face" cx="101" cy="71" r="2.6" />
      <circle className="od-no-results-face" cx="115" cy="71" r="2.6" />
      <ellipse
        className="od-no-results-mouth"
        cx="108"
        cy="81.5"
        rx="3.4"
        ry="4"
      />
      <path
        className="od-no-results-spark"
        d="M136 22c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9Z"
      />
      <path
        className="od-no-results-spark od-no-results-spark-small"
        d="M18 18c.6 3.6 1.8 4.8 5.4 5.4-3.6.6-4.8 1.8-5.4 5.4-.6-3.6-1.8-4.8-5.4-5.4 3.6-.6 4.8-1.8 5.4-5.4Z"
      />
    </svg>
  );
}

/** The result of a search or a filter that matches nothing. */
export function NoResults({
  actions,
  children,
  className,
  headingLevel = "h2",
  title,
  ...props
}: NoResultsProps) {
  const Heading = headingLevel as ElementType;
  return (
    <div
      {...props}
      className={["od-no-results", className].filter(Boolean).join(" ")}
    >
      <NoResultsPicture />
      <Heading className="od-no-results-title">{title}</Heading>
      {children ? (
        <div className="od-no-results-description">{children}</div>
      ) : null}
      {actions ? <div className="od-no-results-actions">{actions}</div> : null}
    </div>
  );
}
