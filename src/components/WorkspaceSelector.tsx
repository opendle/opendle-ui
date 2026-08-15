import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface WorkspaceSelectorProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> {
  readonly name: ReactNode;
  readonly detail?: ReactNode;
  readonly avatar: ReactNode;
  readonly end?: ReactNode;
}

export function WorkspaceSelector({
  avatar,
  className,
  detail,
  end,
  name,
  type = "button",
  ...props
}: WorkspaceSelectorProps) {
  return (
    <button
      {...props}
      className={["od-workspace-selector", className].filter(Boolean).join(" ")}
      type={type}
    >
      <span className="od-workspace-avatar">{avatar}</span>
      <span className="od-workspace-copy">
        <strong>{name}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
      {end ? <span className="od-workspace-end">{end}</span> : null}
    </button>
  );
}
