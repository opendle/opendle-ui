import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { classes } from "./classes.js";

export interface InlineEditableTextProps {
  readonly value: string;
  /** Store the new text. A rejection keeps the editor open. */
  readonly onSave: (value: string) => Promise<void>;
  /** The accessible name of the edit action and of the input. */
  readonly label: string;
  readonly maxLength?: number;
  readonly className?: string;
}

/**
 * Text that the user edits in place. A double click or the Enter key starts
 * the edit. Enter saves and Escape cancels.
 */
export function InlineEditableText({
  className,
  label,
  maxLength,
  onSave,
  value,
}: InlineEditableTextProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  const focusInput = useCallback((input: HTMLInputElement | null) => {
    if (input === null) return;
    input.focus();
    input.select();
  }, []);
  const focusButton = useCallback((button: HTMLButtonElement | null) => {
    buttonRef.current = button;
    if (button !== null && restoreFocus.current) {
      restoreFocus.current = false;
      button.focus();
    }
  }, []);

  const stop = useCallback(() => {
    restoreFocus.current = true;
    setDraft(null);
  }, []);

  const save = useCallback(async () => {
    const next = (draft ?? "").trim();
    if (next === "" || next === value) {
      stop();
      return;
    }
    setPending(true);
    try {
      await onSave(next);
      stop();
    } catch {
      // The host shows the failure. The editor stays open for a new attempt.
    } finally {
      setPending(false);
    }
  }, [draft, onSave, stop, value]);

  if (draft === null) {
    return (
      <button
        aria-label={label}
        className={classes("od-inline-editable", className)}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          // A keyboard activation has no click count.
          if (event.detail === 0) setDraft(value);
        }}
        onDoubleClick={() => {
          setDraft(value);
        }}
        ref={focusButton}
        title={label}
        type="button"
      >
        {value}
      </button>
    );
  }
  return (
    <input
      aria-label={label}
      className={classes("od-inline-editable-input", className)}
      readOnly={pending}
      maxLength={maxLength}
      onBlur={() => {
        if (!pending) setDraft(null);
      }}
      onChange={(event) => {
        setDraft(event.currentTarget.value);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
          event.preventDefault();
          void save();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          stop();
        }
      }}
      ref={focusInput}
      value={draft}
    />
  );
}
