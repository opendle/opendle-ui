import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface NavigationItemProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  readonly icon: ReactNode;
  readonly label: ReactNode;
  readonly active?: boolean;
  readonly count?: ReactNode;
  readonly alert?: boolean;
}

export function NavigationItem({
  active = false,
  alert = false,
  className,
  count,
  icon,
  label,
  type = "button",
  ...props
}: NavigationItemProps) {
  return (
    <button
      {...props}
      aria-current={active ? "page" : undefined}
      className={["od-navigation-item", className].filter(Boolean).join(" ")}
      data-active={active}
      type={type}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count !== null ? (
        <b className={alert ? "od-navigation-alert" : undefined}>{count}</b>
      ) : null}
    </button>
  );
}
