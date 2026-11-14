import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { classes } from "./classes.js";

export interface TabItem<Id extends string> {
  readonly id: Id;
  readonly label: ReactNode;
  readonly count?: number;
}

export interface TabsProps<Id extends string> {
  /** The prefix of the tab and panel IDs. Give the same value to `TabPanel`. */
  readonly idBase: string;
  readonly label: string;
  readonly items: readonly TabItem<Id>[];
  readonly value: Id;
  readonly onChange: (id: Id) => void;
  readonly className?: string;
}

/** A tab list with arrow-key movement. The host renders the `TabPanel`. */
export function Tabs<Id extends string>({
  className,
  idBase,
  items,
  label,
  onChange,
  value,
}: TabsProps<Id>) {
  const listRef = useRef<HTMLDivElement>(null);

  function move(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last
          ? 0
          : index + 1
        : event.key === "ArrowLeft"
          ? index === 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    const item = target === null ? undefined : items[target];
    if (item === undefined || target === null) return;
    event.preventDefault();
    onChange(item.id);
    listRef.current
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
      .item(target)
      .focus();
  }

  return (
    <div
      aria-label={label}
      className={classes("od-tabs", className)}
      ref={listRef}
      role="tablist"
    >
      {items.map((item, index) => (
        <button
          aria-controls={`${idBase}-panel-${item.id}`}
          aria-selected={item.id === value}
          className="od-tab"
          id={`${idBase}-tab-${item.id}`}
          key={item.id}
          onClick={() => {
            onChange(item.id);
          }}
          onKeyDown={(event) => {
            move(event, index);
          }}
          role="tab"
          tabIndex={item.id === value ? 0 : -1}
          type="button"
        >
          {item.label}
          {item.count ? <span className="od-count">{item.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export interface TabPanelProps {
  readonly idBase: string;
  readonly id: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/** The content of the selected tab. */
export function TabPanel({ children, className, id, idBase }: TabPanelProps) {
  return (
    <div
      aria-labelledby={`${idBase}-tab-${id}`}
      className={className}
      id={`${idBase}-panel-${id}`}
      role="tabpanel"
    >
      {children}
    </div>
  );
}
