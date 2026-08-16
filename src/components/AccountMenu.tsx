import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface AccountMenuProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "name"
> {
  readonly avatar: ReactNode;
  readonly name: ReactNode;
  readonly detail?: ReactNode;
  readonly end?: ReactNode;
  readonly compact?: boolean;
}

export function AccountMenu({
  avatar,
  className,
  detail,
  end,
  name,
  compact = false,
  type = "button",
  ...props
}: AccountMenuProps) {
  return (
    <button
      {...props}
      className={["od-account-menu", className].filter(Boolean).join(" ")}
      data-compact={compact}
      type={type}
    >
      <span className="od-account-avatar">{avatar}</span>
      <span className="od-account-copy" data-hidden={compact}>
        <strong>{name}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      {end ? <span className="od-account-end">{end}</span> : null}
    </button>
  );
}
