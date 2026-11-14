import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
function clean(text) {
    return text.trim().replace(/^#+/, "").replace(/\s+/g, "-").toLowerCase();
}
/**
 * A list of tags that the user edits in place. Enter or a comma adds the
 * typed tag. Backspace in the empty input removes the last tag.
 */
export function TagInput({ className, disabled = false, label, onChange, placeholder, removeLabel, value, }) {
    const [draft, setDraft] = useState("");
    function add() {
        const tag = clean(draft);
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
    return (_jsxs("span", { className: classes("od-tag-input", className), children: [value.map((tag) => (_jsxs("span", { className: "od-tag od-tag-input-tag", children: ["#", tag, disabled ? null : (_jsx("button", { "aria-label": `${removeLabel}: ${tag}`, className: "od-tag-input-remove", onClick: () => {
                            onChange(value.filter((entry) => entry !== tag));
                        }, title: `${removeLabel}: ${tag}`, type: "button", children: _jsx(Icon, { name: "close", size: 12 }) }))] }, tag))), disabled ? null : (_jsx("input", { "aria-label": label, className: "od-tag-input-field", onBlur: add, onChange: (event) => {
                    setDraft(event.currentTarget.value);
                }, onKeyDown: keyDown, placeholder: placeholder, size: Math.max(6, (draft === "" ? (placeholder ?? "") : draft).length + 1), value: draft }))] }));
}
//# sourceMappingURL=TagInput.js.map