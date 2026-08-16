import type { HTMLAttributes, ReactNode } from "react";

export interface ToastProps extends HTMLAttributes<HTMLOutputElement> {
  readonly children: ReactNode;
  readonly onDismiss?: () => void;
}

export function Toast({
  children,
  className,
  onDismiss,
  ...props
}: ToastProps) {
  return (
    <output
      {...props}
      className={["od-toast", className].filter(Boolean).join(" ")}
    >
      <span>{children}</span>
      {onDismiss ? (
        <button type="button" aria-label="Dismiss message" onClick={onDismiss}>
          ×
        </button>
      ) : null}
    </output>
  );
}
