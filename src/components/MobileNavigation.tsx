import type { HTMLAttributes, ReactNode } from "react";

export interface MobileNavigationItem {
  readonly id: string;
  readonly label: ReactNode;
  readonly icon: ReactNode;
  readonly active?: boolean;
  readonly badge?: ReactNode;
}

export interface MobileNavigationProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "onSelect"> {
  readonly items: readonly MobileNavigationItem[];
  readonly onSelect: (id: string) => void;
}

export function MobileNavigation({ className, items, onSelect, ...props }: MobileNavigationProps) {
  return (
    <nav {...props} className={["od-mobile-navigation", "mobile-navigation", className].filter(Boolean).join(" ")}>
      {items.map((item) => (
        <button type="button" data-active={item.active ?? false} key={item.id} aria-label={typeof item.label === "string" ? item.label : undefined} onClick={() => onSelect(item.id)}>
          {item.icon}
          <span>{item.label}</span>
          {item.badge !== undefined && item.badge !== null ? <i>{item.badge}</i> : null}
        </button>
      ))}
    </nav>
  );
}
