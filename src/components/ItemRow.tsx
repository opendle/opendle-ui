import type { ReactNode } from "react";

export interface ItemRowProps {
  readonly icon?: ReactNode;
  readonly title: ReactNode;
  readonly meta?: ReactNode;
  readonly actions?: ReactNode;
}

export function ItemRow({ actions, icon, meta, title }: ItemRowProps) {
  return (
    <li className="od-list-row">
      {icon ? <span className="od-list-icon">{icon}</span> : null}
      <span className="od-list-copy">
        <span className="od-list-title">{title}</span>
        {meta ? <span className="od-list-meta">{meta}</span> : null}
      </span>
      {actions}
    </li>
  );
}
