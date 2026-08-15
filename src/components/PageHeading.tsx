import type { ElementType, ReactNode } from "react";

export interface PageHeadingProps {
  readonly eyebrow: ReactNode;
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
  readonly headingLevel?: "h1" | "h2" | "h3";
}

export function PageHeading({
  actions,
  className,
  description,
  eyebrow,
  headingLevel = "h1",
  title,
}: PageHeadingProps) {
  const Heading = headingLevel as ElementType;
  return (
    <div className={["od-page-heading", className].filter(Boolean).join(" ")}>
      <div>
        <p className="od-eyebrow">{eyebrow}</p>
        <Heading>{title}</Heading>
        {description ? <p className="od-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="od-heading-actions">{actions}</div> : null}
    </div>
  );
}
