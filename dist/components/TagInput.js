import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useState } from "react";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
function clean(text) {
    return text.trim().replace(/^#+/, "").replace(/\s+/g, "-").toLowerCase();
}
/**
 * A list of tags that the user edits in place. Enter or a comma adds the
 * typed tag. Backspace in the empty input removes the last tag. The input
 * suggests the known tags that are not in the list.
 */
export function TagInput({ className, colors, disabled = false, label, onChange, placeholder, removeLabel, suggestions, value, }) {
    const [draft, setDraft] = useState("");
    const listId = useId();
    const offered = (suggestions ?? []).filter((tag) => !value.includes(tag));
    function add(text = draft) {
        const tag = clean(text);
        setDraft("");
        if (tag !== "" && !value.includes(tag))
            onChange([...value, tag]);
    }
    function keyDown(event) {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            add();
        }
        else if (event.key === "Backspace" && draft === "" && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    }
    return (_jsxs("span", { className: classes("od-tag-input", className), children: [value.map((tag) => (_jsxs("span", { className: "od-tag od-tag-input-tag", "data-color": colors?.[tag], children: ["#", tag, disabled ? null : (_jsx("button", { "aria-label": `${removeLabel}: ${tag}`, className: "od-tag-input-remove", onClick: () => {
                            onChange(value.filter((entry) => entry !== tag));
                        }, title: `${removeLabel}: ${tag}`, type: "button", children: _jsx(Icon, { name: "close", size: 12 }) }))] }, tag))), disabled ? null : (_jsx("input", { "aria-label": label, className: "od-tag-input-field", list: offered.length === 0 ? undefined : listId, onBlur: () => {
                    add();
                }, onChange: (event) => {
                    const text = event.currentTarget.value;
                    // A choice in the suggestion list replaces the text in one step.
                    const kind = event.nativeEvent.inputType;
                    const picked = (kind === undefined || kind === "insertReplacementText") &&
                        offered.includes(clean(text));
                    if (picked)
                        add(text);
                    else
                        setDraft(text);
                }, onKeyDown: keyDown, placeholder: placeholder, size: Math.max(6, (draft === "" ? (placeholder ?? "") : draft).length + 1), value: draft })), disabled || offered.length === 0 ? null : (_jsx("datalist", { id: listId, children: offered.map((tag) => (_jsx("option", { value: tag, children: tag }, tag))) }))] }));
}
//# sourceMappingURL=TagInput.js.map