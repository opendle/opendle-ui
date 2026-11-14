import { useId, type ReactNode } from "react";

import { classes } from "./classes.js";

export interface PageHeadingProps {
  readonly title: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function PageHeading({ actions, className, title }: PageHeadingProps) {
  return (
    <header className={classes("pp-page-heading", className)}>
      <h1>{title}</h1>
      {actions ? (
        <div className="pp-page-heading-actions">{actions}</div>
      ) : null}
    </header>
  );
}

export interface SectionProps {
  readonly title: ReactNode;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

/** A titled part of a page. */
export function Section({ actions, children, className, title }: SectionProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className={classes("pp-section", className)}
    >
      <div className="pp-section-heading">
        <h2 id={headingId}>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export interface CardProps {
  readonly children: ReactNode;
  readonly padded?: boolean;
  readonly className?: string;
}

/** A bordered surface. */
export function Card({ children, className, padded = false }: CardProps) {
  return (
    <div className={classes("pp-card", className)} data-padded={padded}>
      {children}
    </div>
  );
}

export interface ItemListProps {
  readonly children: ReactNode;
  /** Shown in place of the list when it has no rows. */
  readonly empty?: ReactNode;
  readonly className?: string;
}

/** A list of `ItemRow` elements with hairline separators. */
export function ItemList({ children, className, empty }: ItemListProps) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  if (!hasRows && empty !== undefined) {
    return <p className="pp-list-empty">{empty}</p>;
  }
  return <ul className={classes("pp-list", className)}>{children}</ul>;
}

export interface ItemRowProps {
  readonly icon?: ReactNode;
  readonly title: ReactNode;
  readonly meta?: ReactNode;
  readonly actions?: ReactNode;
}

export function ItemRow({ actions, icon, meta, title }: ItemRowProps) {
  return (
    <li className="pp-list-row">
      {icon ? <span className="pp-list-icon">{icon}</span> : null}
      <span className="pp-list-copy">
        <span className="pp-list-title">{title}</span>
        {meta ? <span className="pp-list-meta">{meta}</span> : null}
      </span>
      {actions}
    </li>
  );
}
