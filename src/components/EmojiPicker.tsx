import {
  useCallback,
  useEffect,
  useId,
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

/** A button that opens a small grid of emoji. */
export function EmojiPicker({
  disabled = false,
  emoji = conversationEmoji,
  label,
  onSelect,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const gridId = useId();

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
    grid?.querySelector<HTMLElement>("button")?.focus();
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
