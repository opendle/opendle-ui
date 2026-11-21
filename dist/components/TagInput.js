import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useRef, useState } from "react";
import { classes } from "./classes.js";
import { cycleIndex } from "./cycleIndex.js";
import { Icon } from "./Icon.js";
import { useAnchoredListbox } from "./useAnchoredListbox.js";
const noTags = [];
/** The approximate height of one option, for the first placement. */
const optionHeight = 34;
function clean(text) {
    return text.trim().replace(/^#+/, "").replace(/\s+/g, "-").toLowerCase();
}
/**
 * The known tags that contain the text, the tags that start with it first,
 * then the typed tag when it is new.
 */
function tagChoices(suggestions, value, query) {
    const offered = [...new Set(suggestions)].filter((tag) => !value.includes(tag));
    const starts = offered.filter((tag) => clean(tag).startsWith(query));
    const contains = offered.filter((tag) => !starts.includes(tag) && clean(tag).includes(query));
    const found = [...starts, ...contains];
    const creates = query !== "" &&
        !value.includes(query) &&
        !found.some((tag) => clean(tag) === query);
    return [
        ...found.map((tag) => ({ tag, created: false })),
        ...(creates ? [{ tag: query, created: true }] : []),
    ];
}
/** One known tag in its colour, or the option that creates the typed tag. */
function TagOption({ active, choice, color, createLabel, id, onPick, }) {
    return (_jsxs("li", { "aria-label": choice.created ? `${createLabel} #${choice.tag}` : undefined, "aria-selected": active, className: "od-tag-input-option", "data-created": choice.created || undefined, id: id, onClick: () => {
            onPick(choice.tag);
        }, role: "option", children: [choice.created ? _jsx(Icon, { name: "plus", size: 12 }) : null, _jsxs("span", { className: "od-tag", "data-color": choice.created ? undefined : color, children: ["#", choice.tag] })] }));
}
/**
 * A list of tags that the user edits in place. A fixed `#` comes before the
 * text. While the user types, a list shows the known tags that match. The
 * arrow keys move in the list, Enter adds the active tag or else the typed
 * tag, and a comma adds the typed tag. A typed tag that is a known tag adds
 * the known tag. Backspace in the empty input removes the last tag.
 */
export function TagInput({ addLabel = "add tag", className, colors, createLabel = "Create", disabled = false, label, onChange, removeLabel, suggestions = noTags, value, }) {
    const [draft, setDraft] = useState("");
    const [expanded, setExpanded] = useState(false);
    const [active, setActive] = useState(-1);
    const listId = useId();
    const entryRef = useRef(null);
    const listRef = useRef(null);
    const query = clean(draft);
    const choices = tagChoices(suggestions, value, query);
    const open = !disabled && expanded && choices.length > 0;
    const current = open && active < choices.length ? active : -1;
    const optionId = (index) => `${listId}-${String(index)}`;
    useAnchoredListbox(open, choices.length * optionHeight + 10, entryRef, listRef, false);
    function close() {
        setExpanded(false);
        setActive(-1);
    }
    function add(text) {
        const tag = clean(text);
        setDraft("");
        close();
        if (tag === "")
            return;
        const known = suggestions.find((entry) => clean(entry) === tag) ?? tag;
        if (!value.includes(known))
            onChange([...value, known]);
    }
    function move(event, down) {
        if (choices.length === 0)
            return;
        event.preventDefault();
        const next = cycleIndex(current, choices.length, down ? 1 : -1);
        setExpanded(true);
        setActive(next);
        event.currentTarget.ownerDocument
            .getElementById(optionId(next))
            ?.scrollIntoView({ block: "nearest" });
    }
    function keyDown(event) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            move(event, event.key === "ArrowDown");
        }
        else if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            const choice = event.key === "Enter" ? choices[current] : undefined;
            add(choice?.tag ?? draft);
        }
        else if (event.key === "Escape" && open) {
            event.preventDefault();
            event.stopPropagation();
            close();
        }
        else if (event.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    }
    return (_jsxs("span", { className: classes("od-tag-input", className), children: [value.map((tag) => (_jsxs("span", { className: "od-tag od-tag-input-tag", "data-color": colors?.[tag], children: ["#", tag, disabled ? null : (_jsx("button", { "aria-label": `${removeLabel}: ${tag}`, className: "od-tag-input-remove", onClick: () => {
                            onChange(value.filter((entry) => entry !== tag));
                        }, title: `${removeLabel}: ${tag}`, type: "button", children: _jsx(Icon, { name: "close", size: 12 }) }))] }, tag))), disabled ? null : (_jsxs("label", { className: "od-tag-input-entry", ref: entryRef, children: [_jsx("span", { "aria-hidden": "true", className: "od-tag-input-hash", children: "#" }), _jsx("input", { "aria-activedescendant": current < 0 ? undefined : optionId(current), "aria-autocomplete": "list", "aria-controls": open ? listId : undefined, "aria-expanded": open, "aria-label": label, autoComplete: "off", className: "od-tag-input-field", onBlur: () => {
                            add(draft);
                        }, onChange: (event) => {
                            // The `#` is fixed in front of the text.
                            setDraft(event.currentTarget.value.replace(/^\s*#+/, ""));
                            setExpanded(true);
                            setActive(-1);
                        }, onClick: () => {
                            setExpanded(true);
                        }, onKeyDown: keyDown, placeholder: addLabel, role: "combobox", size: Math.max(4, (draft === "" ? addLabel : draft).length + 1), spellCheck: false, value: draft })] })), open ? (_jsx("ul", { "aria-label": label, className: "od-tag-input-list", id: listId, onMouseDown: (event) => {
                    event.preventDefault();
                }, popover: "manual", ref: listRef, role: "listbox", children: choices.map((choice, index) => (_jsx(TagOption, { active: index === current, choice: choice, color: colors?.[choice.tag], createLabel: createLabel, id: optionId(index), onPick: add }, choice.created ? "" : choice.tag))) })) : null] }));
}
//# sourceMappingURL=TagInput.js.map