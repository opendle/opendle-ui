import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  readonly icon: ReactNode;
}

export function IconButton({ className, icon, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      {...props}
      className={["od-icon-button", className].filter(Boolean).join(" ")}
      type={type}
    >
      {icon}
    </button>
  );
}
