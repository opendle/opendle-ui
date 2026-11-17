import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
import { SearchableSelect, } from "./SearchableSelect.js";
/**
 * A searchable select that adds each choice to a list of removable chips.
 * The search shows only the options that are not selected.
 */
export function SearchableMultiSelect({ className, disabled = false, label, noResultsLabel, onChange, options, placeholder, removeLabel, value, }) {
    const selected = new Set(value);
    const labels = new Map(options.map((option) => [option.value, option.label]));
    return (_jsxs("div", { className: classes("od-multi-select", className), children: [_jsx(SearchableSelect, { disabled: disabled, label: label, onChange: (choice) => {
                    if (!selected.has(choice))
                        onChange([...value, choice]);
                }, options: options.filter((option) => !selected.has(option.value)), value: "", ...(placeholder === undefined ? {} : { placeholder }), ...(noResultsLabel === undefined ? {} : { noResultsLabel }) }), value.length === 0 ? null : (_jsx("ul", { "aria-label": label, className: "od-multi-select-values", children: value.map((item) => {
                    const name = labels.get(item) ?? item;
                    return (_jsxs("li", { className: "od-tag od-multi-select-value", children: [name, disabled ? null : (_jsx("button", { "aria-label": `${removeLabel}: ${name}`, className: "od-tag-input-remove", onClick: () => {
                                    onChange(value.filter((entry) => entry !== item));
                                }, title: `${removeLabel}: ${name}`, type: "button", children: _jsx(Icon, { name: "close", size: 12 }) }))] }, item));
                }) }))] }));
}
//# sourceMappingURL=SearchableMultiSelect.js.map