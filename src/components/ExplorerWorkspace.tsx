import { useId, type HTMLAttributes, type ReactNode } from "react";

import {
  ONTOLOGY_PAGE_LIMIT,
  assertBoundedItems,
  assertIdentifier,
  assertTextMaximum,
} from "../OntologyExplorerContract.js";

export interface ExplorerNavigationItem {
  readonly id: string;
  readonly label: ReactNode;
  readonly count?: number;
  readonly disabled?: boolean;
}

export interface ExplorerWorkspaceProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect" | "title"
> {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly navigationLabel: string;
  readonly navigationItems: readonly ExplorerNavigationItem[];
  readonly activeItem: string;
  readonly onSelect: (id: string) => void;
  readonly children: ReactNode;
  readonly inspector?: ReactNode;
}

/** A reusable explorer shell. Hosts own route changes, data, and copy. */
export function ExplorerWorkspace({
  actions,
  activeItem,
  children,
  className,
  description,
  inspector,
  navigationItems,
  navigationLabel,
  onSelect,
  title,
  ...props
}: ExplorerWorkspaceProps) {
  const titleId = useId();
  assertBoundedItems(
    "Explorer navigation items",
    navigationItems,
    ONTOLOGY_PAGE_LIMIT,
  );
  const ids = new Set<string>();
  for (const item of navigationItems) {
    assertIdentifier("Explorer navigation identifier", item.id);
    if (ids.has(item.id)) {
      throw new TypeError(
        "Explorer navigation identifiers must be non-empty and unique.",
      );
    }
    assertTextMaximum("Explorer navigation identifier", item.id, 200);
    if (
      item.count !== undefined &&
      (!Number.isSafeInteger(item.count) || item.count < 0)
    ) {
      throw new RangeError(
        "Explorer navigation counts must be non-negative integers.",
      );
    }
    ids.add(item.id);
  }
  if (!ids.has(activeItem)) {
    throw new TypeError(
      "The active explorer item must exist in the navigation.",
    );
  }
  return (
    <section
      {...props}
      aria-labelledby={titleId}
      className={["od-explorer-workspace", className].filter(Boolean).join(" ")}
    >
      <header className="od-explorer-workspace-heading">
        <div>
          <h1 id={titleId}>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? (
          <div className="od-explorer-workspace-actions">{actions}</div>
        ) : null}
      </header>
      <nav aria-label={navigationLabel} className="od-explorer-navigation">
        {navigationItems.map((item) => (
          <button
            aria-current={item.id === activeItem ? "page" : undefined}
            disabled={item.disabled}
            key={item.id}
            onClick={() => {
              onSelect(item.id);
            }}
            type="button"
          >
            <span>{item.label}</span>
            {item.count === undefined ? null : <strong>{item.count}</strong>}
          </button>
        ))}
      </nav>
      <div className="od-explorer-workspace-body">
        <div className="od-explorer-workspace-content">{children}</div>
        {inspector ? (
          <aside
            aria-label="Selected item details"
            className="od-explorer-workspace-inspector"
          >
            {inspector}
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export type ExplorerResourceState =
  "loading" | "empty" | "error" | "stale" | "offline" | "recovering";

export interface ExplorerStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "title"
> {
  readonly state: ExplorerResourceState;
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly action?: ReactNode;
}

/** A live state message for bounded resource loading and recovery. */
export function ExplorerState({
  action,
  className,
  description,
  state,
  title,
  ...props
}: ExplorerStateProps) {
  const titleId = useId();
  return (
    <div
      {...props}
      aria-labelledby={titleId}
      aria-live={
        state === "error" || state === "offline" ? "assertive" : "polite"
      }
      aria-busy={state === "loading" || state === "recovering"}
      className={["od-explorer-state", className].filter(Boolean).join(" ")}
      data-state={state}
      role={state === "error" || state === "offline" ? "alert" : "status"}
    >
      <span aria-hidden="true" className="od-explorer-state-mark" />
      <div>
        <h2 id={titleId}>{title}</h2>
        <div className="od-explorer-state-description">{description}</div>
      </div>
      {action ? <div className="od-explorer-state-action">{action}</div> : null}
    </div>
  );
}
