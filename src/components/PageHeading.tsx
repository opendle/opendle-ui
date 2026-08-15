import type { ReactNode } from "react";

export interface PageHeadingProps {
  readonly eyebrow: ReactNode;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function PageHeading({
  actions,
  className,
  description,
  eyebrow,
  title,
}: PageHeadingProps) {
  return (
    <div className={["od-page-heading", className].filter(Boolean).join(" ")}>
      <div>
        <p className="od-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p className="od-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="od-heading-actions">{actions}</div> : null}
    </div>
  );
}
