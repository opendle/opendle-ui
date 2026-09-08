import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
// react-doctor-disable-next-line react-doctor/no-flush-sync -- The native modal must close before the host moves focus or the browser follows its link.
import { createPortal, flushSync } from "react-dom";

import { ApplicationNavigation } from "./ApplicationShell.js";
import { Button } from "./Button.js";
import { Dialog } from "./Dialog.js";
import { NavigationLink } from "./NavigationLink.js";

export interface MobileNavigationItem {
  readonly id: string;
  readonly label: ReactNode;
  readonly icon: ReactNode;
  readonly active?: boolean;
  readonly badge?: ReactNode;
  readonly href?: string;
}

export interface MobileNavigationDestination extends MobileNavigationItem {
  readonly href: string;
}

export interface MobileNavigationSurface {
  readonly label: string;
  readonly icon: ReactNode;
  readonly applicationName: string;
  readonly context: { readonly label: string; readonly value: string };
  readonly accountActions: ReactNode;
  readonly closeLabel: string;
  readonly items: readonly MobileNavigationDestination[];
}

export interface MobileNavigationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onSelect"
> {
  readonly items: readonly MobileNavigationItem[];
  readonly onSelect?: (id: string) => void;
  readonly onNavigate?: (
    item: MobileNavigationDestination,
    event: MouseEvent<HTMLAnchorElement>,
  ) => void;
  readonly surface?: MobileNavigationSurface;
}

/** A persistent row with optional host-owned destinations and account access. */
export function MobileNavigation({
  className,
  items,
  onNavigate,
  onSelect,
  surface,
  ...props
}: MobileNavigationProps) {
  const [mode, setMode] = useState<"closed" | "open" | "navigate">("closed");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const surfaceId = useId();
  const navigate = (
    item: MobileNavigationDestination,
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey
    )
      return;
    // Close the native modal before the host changes the route or focus.
    flushSync(() => {
      setMode("navigate");
    });
    onNavigate?.(item, event);
  };
  return (
    <>
      <nav
        {...props}
        className={["od-mobile-navigation", "mobile-navigation", className]
          .filter(Boolean)
          .join(" ")}
      >
        {items.map((item) =>
          item.href !== undefined ? (
            <NavigationLink
              active={item.active ?? false}
              href={item.href}
              icon={item.icon}
              label={item.label}
              count={item.badge}
              key={item.id}
              onClick={(event) => {
                if (item.href !== undefined)
                  navigate({ ...item, href: item.href }, event);
              }}
            />
          ) : (
            <button
              type="button"
              data-active={item.active ?? false}
              key={item.id}
              aria-label={
                typeof item.label === "string" ? item.label : undefined
              }
              onClick={() => onSelect?.(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge !== null ? (
                <i>{item.badge}</i>
              ) : null}
            </button>
          ),
        )}
        {surface === undefined ? null : (
          <button
            aria-controls={surfaceId}
            aria-expanded={mode === "open"}
            aria-haspopup="dialog"
            onClick={() => {
              setMode("open");
            }}
            ref={triggerRef}
            type="button"
          >
            {surface.icon}
            <span>{surface.label}</span>
          </button>
        )}
      </nav>
      {surface === undefined || typeof document === "undefined"
        ? null
        : createPortal(
            <Dialog
              actions={
                <>
                  {surface.accountActions}
                  <Button
                    onClick={() => {
                      setMode("closed");
                    }}
                    variant="quiet"
                  >
                    {surface.closeLabel}
                  </Button>
                </>
              }
              className="od-mobile-navigation-surface"
              description={
                <section aria-label={surface.context.label}>
                  <strong>{surface.context.label}</strong>:{" "}
                  {surface.context.value}
                </section>
              }
              id={surfaceId}
              onClose={() => {
                setMode("closed");
              }}
              open={mode === "open"}
              restoreFocusOnClose={mode !== "navigate"}
              returnFocusRef={triggerRef}
              showCloseButton={false}
              title={surface.applicationName}
            >
              <ApplicationNavigation aria-label={surface.label}>
                {surface.items.map((item, index) => (
                  <NavigationLink
                    active={item.active ?? false}
                    count={item.badge}
                    data-dialog-initial-focus={index === 0 ? "true" : undefined}
                    href={item.href}
                    icon={item.icon}
                    key={item.id}
                    label={item.label}
                    onClick={(event) => {
                      navigate(item, event);
                    }}
                  />
                ))}
              </ApplicationNavigation>
            </Dialog>,
            document.body,
          )}
    </>
  );
}
