import { useId, useState, type KeyboardEvent } from "react";

import { classes } from "./classes.js";
import { Icon } from "./Icon.js";

export interface TagInputProps {
  readonly value: readonly string[];
  readonly onChange: (value: readonly string[]) => void;
  /** The accessible name of the text input. */
  readonly label: string;
  /** The accessible name of a remove button. It gets the tag after it. */
  readonly removeLabel: string;
  /** The colour key, from 1 to 12, of each tag name. */
  readonly colors?: Readonly<Record<string, number>>;
  /** Known tags that the input suggests. A chosen suggestion is added at once. */
  readonly suggestions?: readonly string[];
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

function clean(text: string): string {
  return text.trim().replace(/^#+/, "").replace(/\s+/g, "-").toLowerCase();
}

/**
 * A list of tags that the user edits in place. Enter or a comma adds the
 * typed tag. Backspace in the empty input removes the last tag. The input
 * suggests the known tags that are not in the list.
 */
export function TagInput({
  className,
  colors,
  disabled = false,
  label,
  onChange,
  placeholder,
  removeLabel,
  suggestions,
  value,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const listId = useId();
  const offered = (suggestions ?? []).filter((tag) => !value.includes(tag));

  function add(text = draft) {
    const tag = clean(text);
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
        <span
          className="od-tag od-tag-input-tag"
          data-color={colors?.[tag]}
          key={tag}
        >
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
          list={offered.length === 0 ? undefined : listId}
          onBlur={() => {
            add();
          }}
          onChange={(event) => {
            const text = event.currentTarget.value;
            // A choice in the suggestion list replaces the text in one step.
            const kind = (event.nativeEvent as Partial<InputEvent>).inputType;
            const picked =
              (kind === undefined || kind === "insertReplacementText") &&
              offered.includes(clean(text));
            if (picked) add(text);
            else setDraft(text);
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
      {disabled || offered.length === 0 ? null : (
        <datalist id={listId}>
          {offered.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </datalist>
      )}
    </span>
  );
}
