import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";

export interface AccountMenuItem {
  readonly id: string;
  readonly label: string;
  readonly icon?: ReactNode;
  /** A second line below the label, for example who sent an invitation. */
  readonly detail?: string;
  /** Mark the selected entry of a section of choices. */
  readonly current?: boolean;
  readonly onSelect: () => void;
}

export interface AccountMenuSection {
  readonly id: string;
  /** The accessible name of the section. */
  readonly label?: string;
  readonly items: readonly AccountMenuItem[];
}

export interface AccountMenuProps {
  /** An `Avatar` element. */
  readonly avatar: ReactNode;
  readonly name: string;
  readonly sections: readonly AccountMenuSection[];
  readonly className?: string;
  /** Use a card trigger and open the menu below it. */
  readonly appearance?: "account" | "workspace";
  readonly detail?: string;
  readonly label?: string;
  /**
   * A count badge on the trigger, for example open invitations. Zero shows
   * no badge.
   */
  readonly count?: number;
  /** The accessible text of the count, for example `2 invitations`. */
  readonly countLabel?: string;
}

const itemSelector = '[role="menuitem"], [role="menuitemradio"]';

/**
 * The signed-in person at the end of the application sidebar. A press opens
 * a menu with the actions of the account.
 */
export function AccountMenu({
  avatar,
  appearance = "account",
  className,
  count = 0,
  countLabel,
  detail,
  label,
  name,
  sections,
}: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback((restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

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

  const focusFirst = useCallback((menu: HTMLDivElement | null) => {
    menu?.querySelector<HTMLElement>(itemSelector)?.focus();
  }, []);

  function move(event: KeyboardEvent<HTMLDivElement>) {
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
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>(itemSelector),
    ];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const last = items.length - 1;
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
    items[target]?.focus();
  }

  const counted = count > 0 && countLabel !== undefined;
  const accessibleName =
    label === undefined || !counted ? label : `${label} (${countLabel})`;
  return (
    <div
      className={classes("od-account", className)}
      data-appearance={appearance}
      ref={rootRef}
    >
      <button
        aria-label={accessibleName}
        aria-controls={open ? menuId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        className="od-account-menu"
        onClick={() => {
          setOpen((value) => !value);
        }}
        ref={buttonRef}
        title={name}
        type="button"
      >
        {avatar}
        <span className="od-navigation-label">
          <strong>{name}</strong>
          {detail === undefined ? null : <small>{detail}</small>}
        </span>
        {count > 0 ? (
          <span aria-hidden={counted || undefined} className="od-count">
            {count}
          </span>
        ) : null}
        <Icon className="od-account-chevron" name="chevron-down" size={15} />
      </button>
      {open ? (
        <div
          aria-label={name}
          className="od-account-popup"
          id={menuId}
          onKeyDown={move}
          ref={focusFirst}
          role="menu"
          tabIndex={-1}
        >
          {sections.map((section) => (
            <fieldset
              aria-label={section.label}
              className="od-account-section"
              key={section.id}
            >
              {section.label === undefined ? null : (
                <span aria-hidden="true" className="od-account-section-label">
                  {section.label}
                </span>
              )}
              {section.items.map((item) => (
                <button
                  aria-checked={item.current}
                  className="od-account-item"
                  key={item.id}
                  onClick={() => {
                    close(true);
                    item.onSelect();
                  }}
                  role={
                    item.current === undefined ? "menuitem" : "menuitemradio"
                  }
                  tabIndex={-1}
                  type="button"
                >
                  {item.icon}
                  {item.detail === undefined ? (
                    <span>{item.label}</span>
                  ) : (
                    <span className="od-account-item-text">
                      <span>{item.label}</span>
                      <small>{item.detail}</small>
                    </span>
                  )}
                  {item.current === true ? (
                    <Icon
                      className="od-account-item-check"
                      name="check"
                      size={15}
                    />
                  ) : null}
                </button>
              ))}
            </fieldset>
          ))}
        </div>
      ) : null}
    </div>
  );
}
