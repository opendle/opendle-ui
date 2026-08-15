import type { AnchorHTMLAttributes, ReactNode } from "react";

export interface NavigationLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "title"> {
  readonly icon: ReactNode;
  readonly label: ReactNode;
  readonly active?: boolean;
  readonly count?: ReactNode;
}

export function NavigationLink({
  active = false,
  className,
  count,
  icon,
  label,
  ...props
}: NavigationLinkProps) {
  return (
    <a
      {...props}
      aria-current={active ? "page" : undefined}
      className={["od-navigation-item", className].filter(Boolean).join(" ")}
      data-active={active}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && count !== null ? <b>{count}</b> : null}
    </a>
  );
}
