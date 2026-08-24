import type { HTMLAttributes, ReactNode } from "react";

export interface PageSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly edgeToEdge?: boolean;
}

/** One full-width page boundary with a shared responsive gutter mode. */
export function PageSurface({
  children,
  className,
  edgeToEdge = false,
  ...props
}: PageSurfaceProps) {
  return (
    <div
      {...props}
      className={["od-page-surface", className].filter(Boolean).join(" ")}
      data-edge-to-edge={edgeToEdge}
    >
      {children}
    </div>
  );
}
