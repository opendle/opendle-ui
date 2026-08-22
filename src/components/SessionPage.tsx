import {
  useId,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { Card } from "./Card.js";

export interface SessionPageProps extends HTMLAttributes<HTMLElement> {
  readonly children?: ReactNode;
}

/** A centered page boundary for sign-in, session, and bootstrap states. */
export function SessionPage({
  children,
  className,
  ...props
}: SessionPageProps) {
  return (
    <main
      {...props}
      className={["od-session-page", className].filter(Boolean).join(" ")}
    >
      {children}
    </main>
  );
}

export interface SessionCardProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly icon?: ReactNode;
  readonly actions?: ReactNode;
  readonly feedback?: ReactNode;
  readonly footer?: ReactNode;
  readonly headingLevel?: "h1" | "h2" | "h3";
}

/** A product-neutral card for one bounded session action. */
export function SessionCard({
  actions,
  className,
  description,
  eyebrow,
  feedback,
  footer,
  headingLevel = "h1",
  icon,
  title,
  "aria-labelledby": labelledBy,
  ...props
}: SessionCardProps) {
  const generatedHeadingId = useId();
  const Heading = headingLevel as ElementType;
  return (
    <Card
      {...props}
      aria-labelledby={labelledBy ?? generatedHeadingId}
      className={["od-session-card", className].filter(Boolean).join(" ")}
    >
      {icon ? <span className="od-session-icon">{icon}</span> : null}
      {eyebrow ? <p className="od-session-eyebrow">{eyebrow}</p> : null}
      <Heading id={labelledBy === undefined ? generatedHeadingId : undefined}>
        {title}
      </Heading>
      {description ? (
        <div className="od-session-description">{description}</div>
      ) : null}
      {actions ? <div className="od-session-actions">{actions}</div> : null}
      {feedback ? <div className="od-session-feedback">{feedback}</div> : null}
      {footer ? <footer className="od-session-footer">{footer}</footer> : null}
    </Card>
  );
}
