import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly icon?: ReactNode;
  readonly variant?: ButtonVariant;
}

export function Button({
  children,
  className,
  icon,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={["od-button", `od-button-${variant}`, className].filter(Boolean).join(" ")}
      type={type}
    >
      {icon}
      {children}
    </button>
  );
}
