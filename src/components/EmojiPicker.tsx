import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { conversationEmoji } from "./conversationLabels.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";

export interface EmojiPickerProps {
  /** The accessible name of the button. */
  readonly label: string;
  readonly onSelect: (emoji: string) => void;
  readonly emoji?: readonly string[];
  readonly disabled?: boolean;
}

const gap = 4;
const margin = 8;

/**
 * Put the grid below the button, or above it when the window has no room
 * below. The grid is fixed to the window, so a container that hides its
 * overflow does not cut it.
 */
function place(button: HTMLElement, grid: HTMLElement) {
  const bounds = button.getBoundingClientRect();
  const height = grid.offsetHeight;
  const width = grid.offsetWidth;
  const below = bounds.bottom + gap + height <= window.innerHeight - margin;
  grid.style.top = `${String(below ? bounds.bottom + gap : Math.max(margin, bounds.top - gap - height))}px`;
  grid.style.left = `${String(Math.max(margin, Math.min(bounds.left, window.innerWidth - width - margin)))}px`;
  grid.dataset.side = below ? "below" : "above";
}

/** A button that opens a small grid of emoji. */
export function EmojiPicker({
  disabled = false,
  emoji = conversationEmoji,
  label,
  onSelect,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLFieldSetElement>(null);
  const gridId = useId();

  useLayoutEffect(() => {
    const button = rootRef.current?.querySelector<HTMLElement>("button");
    const grid = gridRef.current;
    if (!open || !button || !grid) return undefined;
    const update = () => {
      place(button, grid);
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

  const focusFirst = useCallback((grid: HTMLFieldSetElement | null) => {
    gridRef.current = grid;
    grid?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true });
  }, []);

  const closeOnEscape = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);
    rootRef.current?.querySelector<HTMLElement>("button")?.focus();
  };

  return (
    <span className="od-emoji" ref={rootRef}>
      <IconButton
        aria-controls={open ? gridId : undefined}
        aria-expanded={open}
        disabled={disabled}
        icon={<Icon name="smile" />}
        label={label}
        onClick={() => {
          setOpen((value) => !value);
        }}
      />
      {open ? (
        <fieldset
          aria-label={label}
          className="od-emoji-grid"
          id={gridId}
          ref={focusFirst}
        >
          {emoji.map((entry) => (
            <button
              key={entry}
              onKeyDown={closeOnEscape}
              onClick={() => {
                setOpen(false);
                onSelect(entry);
              }}
              type="button"
            >
              {entry}
            </button>
          ))}
        </fieldset>
      ) : null}
    </span>
  );
}
