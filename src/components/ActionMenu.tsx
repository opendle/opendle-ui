import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { placePanel } from "./placePanel.js";

export interface ActionMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode;
  /** `danger` marks an action that removes or ends something. */
  readonly tone?: "default" | "danger";
  /** Go to this address. Without it, the item calls `onSelect`. */
  readonly href?: string;
  readonly onSelect?: () => void;
}

export interface ActionMenuProps {
  /** The accessible name of the button and of the menu. */
  readonly label: string;
  readonly items: readonly ActionMenuItem[];
  /** The icon of the button. The default is three dots. */
  readonly icon?: ReactNode;
  /** Open the menu at the start or at the end of the button. */
  readonly align?: "start" | "end";
  readonly disabled?: boolean;
  readonly className?: string;
}

const itemSelector = '[role="menuitem"]';

/**
 * A "more actions" button that opens a short menu of actions for one object.
 * The arrow keys, Home and End move in the menu. Escape closes it and returns
 * the focus to the button. A press outside or Tab closes it.
 */
export function ActionMenu({
  align = "end",
  className,
  disabled = false,
  icon,
  items,
  label,
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const menu = menuRef.current;
    if (!open || button === null || menu === null) return undefined;
    const update = () => {
      placePanel(button, menu, align);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [align, open]);

  useEffect(() => {
    if (!open) return undefined;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        rootRef.current?.contains(event.target) !== true
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);

  const attachMenu = useCallback((menu: HTMLDivElement | null) => {
    menuRef.current = menu;
    menu
      ?.querySelector<HTMLElement>(itemSelector)
      ?.focus({ preventScroll: true });
  }, []);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  const keyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key === "Tab") {
      setOpen(false);
      return;
    }
    const entries = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(itemSelector),
    ];
    const index = entries.indexOf(event.target as HTMLElement);
    const last = entries.length - 1;
    const target =
      event.key === "ArrowDown"
        ? index >= last
          ? 0
          : index + 1
        : event.key === "ArrowUp"
          ? index <= 0
            ? last
            : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    entries[target]?.focus();
  };

  return (
    <span className={classes("od-action-menu", className)} ref={rootRef}>
      <button
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        className="od-icon-button od-action-menu-button"
        disabled={disabled || items.length === 0}
        onClick={() => {
          setOpen((value) => !value);
        }}
        ref={buttonRef}
        title={label}
        type="button"
      >
        {icon ?? <Icon name="more" />}
      </button>
      {open ? (
        <div
          aria-label={label}
          className="od-action-menu-panel"
          id={menuId}
          onKeyDown={keyDown}
          ref={attachMenu}
          role="menu"
          tabIndex={-1}
        >
          {items.map((item) =>
            item.href === undefined ? (
              <button
                className="od-action-menu-item"
                data-tone={item.tone ?? "default"}
                key={item.id}
                onClick={() => {
                  close(true);
                  item.onSelect?.();
                }}
                role="menuitem"
                tabIndex={-1}
                type="button"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ) : (
              <a
                className="od-action-menu-item"
                data-tone={item.tone ?? "default"}
                href={item.href}
                key={item.id}
                onClick={() => {
                  setOpen(false);
                }}
                role="menuitem"
                tabIndex={-1}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ),
          )}
        </div>
      ) : null}
    </span>
  );
}
