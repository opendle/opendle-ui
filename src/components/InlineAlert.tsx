import type { HTMLAttributes, ReactNode } from "react";

export type InlineAlertTone = "info" | "success" | "warning" | "error";

export interface InlineAlertProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  readonly actions?: ReactNode;
  readonly children: ReactNode;
  readonly title?: ReactNode;
  readonly tone?: InlineAlertTone;
}

export function InlineAlert({
  actions,
  children,
  className,
  role,
  title,
  tone = "info",
  ...props
}: InlineAlertProps) {
  return (
    <div
      {...props}
      className={["od-inline-alert", `od-inline-alert-${tone}`, className]
        .filter(Boolean)
        .join(" ")}
      data-tone={tone}
      role={role ?? (tone === "error" ? "alert" : undefined)}
    >
      <span className="od-inline-alert-mark" aria-hidden="true" />
      <div className="od-inline-alert-copy">
        {title ? <strong>{title}</strong> : null}
        <div>{children}</div>
      </div>
      {actions ? (
        <div className="od-inline-alert-actions">{actions}</div>
      ) : null}
    </div>
  );
}
