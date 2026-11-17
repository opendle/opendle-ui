import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { classes } from "./classes.js";

export interface PopoverProps {
  /** The accessible name of the button and of the panel. */
  readonly label: string;
  /** The icon of the button. */
  readonly icon: ReactNode;
  /** A number on the button, for example the unread items. Zero hides it. */
  readonly count?: number;
  /** The accessible text of a count, for example "3 unread". */
  readonly countLabel?: string;
  /** The panel content. It mounts when the panel opens. */
  readonly children: ReactNode;
  /** Open the panel at the start or at the end of the button. */
  readonly align?: "start" | "end";
  readonly className?: string;
  readonly panelClassName?: string;
  readonly onOpenChange?: (open: boolean) => void;
}

/**
 * An icon button that opens a non-modal panel next to it. Escape, a press
 * outside, a link in the panel or a move of the focus out of it closes the
 * panel. Escape returns the focus to the button.
 */
export function Popover({
  align = "start",
  children,
  className,
  count = 0,
  countLabel,
  icon,
  label,
  onOpenChange,
  panelClassName,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const openChangeRef = useRef(onOpenChange);
  const panelId = useId();

  useEffect(() => {
    openChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const change = useCallback((value: boolean, restoreFocus = false) => {
    setOpen(value);
    openChangeRef.current?.(value);
    if (restoreFocus) buttonRef.current?.focus();
  }, []);

  const close = useEffectEvent((restoreFocus: boolean) => {
    change(false, restoreFocus);
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!open || root === null) return undefined;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.contains(event.target)) {
        close(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      close(true);
    };
    const leave = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (next instanceof Node && !root.contains(next)) close(false);
    };
    document.addEventListener("pointerdown", outside);
    root.addEventListener("keydown", escape);
    root.addEventListener("focusout", leave);
    return () => {
      document.removeEventListener("pointerdown", outside);
      root.removeEventListener("keydown", escape);
      root.removeEventListener("focusout", leave);
    };
  }, [open]);

  // Focus the panel, and close it after a used link.
  const attachPanel = useCallback(
    (panel: HTMLDialogElement | null) => {
      if (panel === null) return undefined;
      panel.focus();
      const follow = (event: MouseEvent) => {
        if (
          event.target instanceof Element &&
          event.target.closest("a[href]") !== null
        ) {
          change(false);
        }
      };
      panel.addEventListener("click", follow);
      return () => {
        panel.removeEventListener("click", follow);
      };
    },
    [change],
  );

  const shown = count > 0;
  const name =
    shown && countLabel !== undefined ? `${label}, ${countLabel}` : label;
  return (
    <div className={classes("od-popover", className)} ref={rootRef}>
      <button
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={name}
        className="od-icon-button od-popover-button"
        onClick={() => {
          change(!open);
        }}
        ref={buttonRef}
        title={label}
        type="button"
      >
        {icon}
        {shown ? (
          <span aria-hidden="true" className="od-count od-popover-count">
            {count > 99 ? "99+" : count}
          </span>
        ) : null}
      </button>
      {open ? (
        <dialog
          aria-label={label}
          className={classes("od-popover-panel", panelClassName)}
          data-align={align}
          id={panelId}
          open
          ref={attachPanel}
          tabIndex={-1}
        >
          {children}
        </dialog>
      ) : null}
    </div>
  );
}
