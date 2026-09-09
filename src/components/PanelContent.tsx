import type { ComponentPropsWithRef } from "react";

export type PanelContentProps = Omit<
  ComponentPropsWithRef<"section">,
  "role" | "aria-label" | "aria-labelledby"
> &
  (
    | { readonly "aria-label": string; readonly "aria-labelledby"?: string }
    | { readonly "aria-label"?: string; readonly "aria-labelledby": string }
  );

/** A labelled, bounded body. Keep the panel heading and close action outside. */
export function PanelContent({
  children,
  className,
  tabIndex = 0,
  ...props
}: PanelContentProps) {
  return (
    <section
      {...props}
      tabIndex={tabIndex}
      className={["od-panel-content", className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
