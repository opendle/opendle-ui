import { useState, type KeyboardEvent } from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";

export interface TagInputProps {
  readonly value: readonly string[];
  readonly onChange: (value: readonly string[]) => void;
  /** The accessible name of the text input. */
  readonly label: string;
  /** The accessible name of a remove button. It gets the tag after it. */
  readonly removeLabel: string;
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

function clean(text: string): string {
  return text.trim().replace(/^#+/, "").replace(/\s+/g, "-").toLowerCase();
}

/**
 * A list of tags that the user edits in place. Enter or a comma adds the
 * typed tag. Backspace in the empty input removes the last tag.
 */
export function TagInput({
  className,
  disabled = false,
  label,
  onChange,
  placeholder,
  removeLabel,
  value,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const tag = clean(draft);
    setDraft("");
    if (tag !== "" && !value.includes(tag)) onChange([...value, tag]);
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <span className={classes("od-tag-input", className)}>
      {value.map((tag) => (
        <span className="od-tag od-tag-input-tag" key={tag}>
          #{tag}
          {disabled ? null : (
            <button
              aria-label={`${removeLabel}: ${tag}`}
              className="od-tag-input-remove"
              onClick={() => {
                onChange(value.filter((entry) => entry !== tag));
              }}
              title={`${removeLabel}: ${tag}`}
              type="button"
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </span>
      ))}
      {disabled ? null : (
        <input
          aria-label={label}
          className="od-tag-input-field"
          onBlur={add}
          onChange={(event) => {
            setDraft(event.currentTarget.value);
          }}
          onKeyDown={keyDown}
          placeholder={placeholder}
          size={Math.max(
            6,
            (draft === "" ? (placeholder ?? "") : draft).length + 1,
          )}
          value={draft}
        />
      )}
    </span>
  );
}
