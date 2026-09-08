import type { AnchorHTMLAttributes } from "react";

export interface SkipLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> {
  readonly href: string;
  readonly label: string;
}

/** A focus-revealed native link to a host-owned content target. */
export function SkipLink({ className, label, ...props }: SkipLinkProps) {
  return (
    <a
      {...props}
      className={["od-skip-link", className].filter(Boolean).join(" ")}
    >
      {label}
    </a>
  );
}
