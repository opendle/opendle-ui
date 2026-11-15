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
import { emojiData, searchEmoji } from "./emojiData.js";
import { Icon } from "./Icon.js";
import { IconButton } from "./IconButton.js";

export interface EmojiPickerProps {
  /** The accessible name of the button. */
  readonly label: string;
  readonly onSelect: (emoji: string) => void;
  /** The emoji that come first when the search field is empty. */
  readonly emoji?: readonly string[];
  readonly disabled?: boolean;
  /** The accessible name of the search field. */
  readonly searchLabel?: string;
  /** The text when no emoji has the words of the search. */
  readonly emptyLabel?: string;
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

/** A button that opens a grid of emoji with a search field. */
export function EmojiPicker({
  disabled = false,
  emoji = conversationEmoji,
  emptyLabel = "No emoji",
  label,
  onSelect,
  searchLabel = "Search emoji",
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shown =
    query.trim() === ""
      ? [...new Set([...emoji, ...emojiData.map(([entry]) => entry)])]
      : searchEmoji(query);
  const rootRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
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

  const focusSearch = useCallback((panel: HTMLDivElement | null) => {
    gridRef.current = panel;
    panel?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
  }, []);

  const close = () => {
    setOpen(false);
    setQuery("");
    rootRef.current?.querySelector<HTMLElement>("button")?.focus();
  };
  const choose = (entry: string) => {
    setOpen(false);
    setQuery("");
    onSelect(entry);
  };
  const closeOnEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    close();
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
        <div className="od-emoji-panel" id={gridId} ref={focusSearch}>
          <input
            aria-label={searchLabel}
            className="od-emoji-search"
            onChange={(event) => {
              setQuery(event.currentTarget.value);
            }}
            onKeyDown={(event) => {
              closeOnEscape(event);
              const first = shown[0];
              if (event.key === "Enter" && first !== undefined) {
                event.preventDefault();
                choose(first);
              }
            }}
            placeholder={searchLabel}
            type="search"
            value={query}
          />
          {shown.length === 0 ? (
            <p className="od-emoji-empty">{emptyLabel}</p>
          ) : (
            <fieldset aria-label={label} className="od-emoji-grid">
              {shown.map((entry) => (
                <button
                  key={entry}
                  onKeyDown={closeOnEscape}
                  onClick={() => {
                    choose(entry);
                  }}
                  type="button"
                >
                  {entry}
                </button>
              ))}
            </fieldset>
          )}
        </div>
      ) : null}
    </span>
  );
}
