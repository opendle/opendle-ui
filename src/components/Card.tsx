import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLElement> {
  readonly children?: ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <section {...props} className={["od-card", className].filter(Boolean).join(" ")}>
      {children}
    </section>
  );
}
