import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";
import { placePanel } from "./placePanel.js";

export interface SavedReply {
  readonly id: string;
  readonly name: string;
  readonly text: string;
}

export interface SavedReplyPickerProps {
  /** The accessible name of the button and of the list. */
  readonly label: string;
  readonly replies: readonly SavedReply[];
  readonly onSelect: (reply: SavedReply) => void;
  readonly disabled?: boolean;
}

/** A button that opens the list of saved replies, next to the emoji button. */
export function SavedReplyPicker({
  disabled = false,
  label,
  onSelect,
  replies,
}: SavedReplyPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useLayoutEffect(() => {
    const button = rootRef.current?.querySelector<HTMLElement>("button");
    const panel = panelRef.current;
    if (!open || !button || !panel) return undefined;
    const update = () => {
      placePanel(button, panel);
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

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

  const focusFirst = useCallback((panel: HTMLDivElement | null) => {
    panelRef.current = panel;
    panel?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  }, []);

  const keyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      rootRef.current?.querySelector<HTMLElement>("button")?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = [
      ...(panelRef.current?.querySelectorAll<HTMLElement>("button") ?? []),
    ];
    const index = buttons.indexOf(event.target as HTMLElement);
    const next =
      buttons[
        (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
          buttons.length
      ];
    event.preventDefault();
    next?.focus();
  };

  return (
    <span className="od-saved-reply-picker" ref={rootRef}>
      <IconButton
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        aria-haspopup="menu"
        disabled={disabled}
        icon={<Icon name="book" />}
        label={label}
        onClick={() => {
          setOpen((value) => !value);
        }}
      />
      {open ? (
        <div
          aria-label={label}
          className="od-saved-reply-panel"
          id={panelId}
          onKeyDown={keyDown}
          ref={focusFirst}
          role="menu"
          tabIndex={-1}
        >
          {replies.map((reply) => (
            <button
              key={reply.id}
              onClick={() => {
                setOpen(false);
                onSelect(reply);
              }}
              role="menuitem"
              type="button"
            >
              <strong>{reply.name}</strong>
              <span>{reply.text}</span>
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );
}
