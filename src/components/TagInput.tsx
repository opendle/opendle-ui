import { useId, useRef, useState, type KeyboardEvent } from "react";

import { classes } from "./classes.js";
import { cycleIndex } from "./cycleIndex.js";
import { Icon } from "./Icon.js";
import { useAnchoredListbox } from "./useAnchoredListbox.js";

export interface TagInputProps {
  readonly value: readonly string[];
  readonly onChange: (value: readonly string[]) => void;
  /** The accessible name of the text input. */
  readonly label: string;
  /** The accessible name of a remove button. It gets the tag after it. */
  readonly removeLabel: string;
  /** The colour key, from 1 to 12, of each tag name. */
  readonly colors?: Readonly<Record<string, number>>;
  /** Known tags. The list under the input shows the tags that match the text. */
  readonly suggestions?: readonly string[];
  /** The text after the fixed `#` in the empty input. */
  readonly addLabel?: string;
  /** The accessible name of the option that adds a new tag, before the tag. */
  readonly createLabel?: string;
  readonly disabled?: boolean;
  readonly className?: string;
}

interface Choice {
  readonly tag: string;
  /** The tag is not a known tag: the choice adds a new tag. */
  readonly created: boolean;
}

const noTags: readonly string[] = [];
/** The approximate height of one option, for the first placement. */
const optionHeight = 34;

function clean(text: string): string {
  return text.trim().replace(/^#+/, "").replace(/\s+/g, "-").toLowerCase();
}

/**
 * The known tags that contain the text, the tags that start with it first,
 * then the typed tag when it is new.
 */
function tagChoices(
  suggestions: readonly string[],
  value: readonly string[],
  query: string,
): readonly Choice[] {
  const offered = [...new Set(suggestions)].filter(
    (tag) => !value.includes(tag),
  );
  const starts = offered.filter((tag) => clean(tag).startsWith(query));
  const contains = offered.filter(
    (tag) => !starts.includes(tag) && clean(tag).includes(query),
  );
  const found = [...starts, ...contains];
  const creates =
    query !== "" &&
    !value.includes(query) &&
    !found.some((tag) => clean(tag) === query);
  return [
    ...found.map((tag) => ({ tag, created: false })),
    ...(creates ? [{ tag: query, created: true }] : []),
  ];
}

interface TagOptionProps {
  readonly choice: Choice;
  readonly active: boolean;
  readonly id: string;
  readonly color: number | undefined;
  readonly createLabel: string;
  readonly onPick: (tag: string) => void;
}

/** One known tag in its colour, or the option that creates the typed tag. */
function TagOption({
  active,
  choice,
  color,
  createLabel,
  id,
  onPick,
}: TagOptionProps) {
  return (
    // react-doctor-disable-next-line react-doctor/no-noninteractive-element-to-interactive-role, react-doctor/click-events-have-key-events -- An option of the ARIA combobox pattern: the keys of the input choose it, and a pointer clicks it.
    <li
      aria-label={choice.created ? `${createLabel} #${choice.tag}` : undefined}
      aria-selected={active}
      className="od-tag-input-option"
      data-created={choice.created || undefined}
      id={id}
      onClick={() => {
        onPick(choice.tag);
      }}
      role="option"
    >
      {choice.created ? <Icon name="plus" size={12} /> : null}
      <span className="od-tag" data-color={choice.created ? undefined : color}>
        #{choice.tag}
      </span>
    </li>
  );
}

/**
 * A list of tags that the user edits in place. A fixed `#` comes before the
 * text. While the user types, a list shows the known tags that match. The
 * arrow keys move in the list, Enter adds the active tag or else the typed
 * tag, and a comma adds the typed tag. A typed tag that is a known tag adds
 * the known tag. Backspace in the empty input removes the last tag.
 */
export function TagInput({
  addLabel = "add tag",
  className,
  colors,
  createLabel = "Create",
  disabled = false,
  label,
  onChange,
  removeLabel,
  suggestions = noTags,
  value,
}: TagInputProps) {
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const entryRef = useRef<HTMLLabelElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const query = clean(draft);
  const choices = tagChoices(suggestions, value, query);
  const open = !disabled && expanded && choices.length > 0;
  const current = open && active < choices.length ? active : -1;
  const optionId = (index: number) => `${listId}-${String(index)}`;

  useAnchoredListbox(
    open,
    choices.length * optionHeight + 10,
    entryRef,
    listRef,
    false,
  );

  function close() {
    setExpanded(false);
    setActive(-1);
  }

  function add(text: string) {
    const tag = clean(text);
    setDraft("");
    close();
    if (tag === "") return;
    const known = suggestions.find((entry) => clean(entry) === tag) ?? tag;
    if (!value.includes(known)) onChange([...value, known]);
  }

  function move(event: KeyboardEvent<HTMLInputElement>, down: boolean) {
    if (choices.length === 0) return;
    event.preventDefault();
    const next = cycleIndex(current, choices.length, down ? 1 : -1);
    setExpanded(true);
    setActive(next);
    event.currentTarget.ownerDocument
      .getElementById(optionId(next))
      ?.scrollIntoView({ block: "nearest" });
  }

  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      move(event, event.key === "ArrowDown");
    } else if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const choice = event.key === "Enter" ? choices[current] : undefined;
      add(choice?.tag ?? draft);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      close();
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
        <label className="od-tag-input-entry" ref={entryRef}>
          <span aria-hidden="true" className="od-tag-input-hash">
            #
          </span>
          {/* react-doctor-disable-next-line react-doctor/no-redundant-roles -- Without a `list` attribute, a text input is a textbox; the combobox role is necessary. */}
          <input
            aria-activedescendant={current < 0 ? undefined : optionId(current)}
            aria-autocomplete="list"
            aria-controls={open ? listId : undefined}
            aria-expanded={open}
            aria-label={label}
            autoComplete="off"
            className="od-tag-input-field"
            onBlur={() => {
              add(draft);
            }}
            onChange={(event) => {
              // The `#` is fixed in front of the text.
              setDraft(event.currentTarget.value.replace(/^\s*#+/, ""));
              setExpanded(true);
              setActive(-1);
            }}
            onClick={() => {
              setExpanded(true);
            }}
            onKeyDown={keyDown}
            placeholder={addLabel}
            role="combobox"
            size={Math.max(4, (draft === "" ? addLabel : draft).length + 1)}
            spellCheck={false}
            value={draft}
          />
        </label>
      )}
      {open ? (
        // The list keeps the focus in the input: the activedescendant pattern.
        // react-doctor-disable-next-line react-doctor/no-noninteractive-element-to-interactive-role, react-doctor/click-events-have-key-events -- The ARIA combobox pattern: the input has the focus and the keys, and a press on the list must not take the focus.
        <ul
          aria-label={label}
          className="od-tag-input-list"
          id={listId}
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          popover="manual"
          ref={listRef}
          role="listbox"
        >
          {choices.map((choice, index) => (
            <TagOption
              active={index === current}
              choice={choice}
              color={colors?.[choice.tag]}
              createLabel={createLabel}
              id={optionId(index)}
              key={choice.created ? "" : choice.tag}
              onPick={add}
            />
          ))}
        </ul>
      ) : null}
    </span>
  );
}
