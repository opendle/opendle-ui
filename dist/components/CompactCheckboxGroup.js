import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AdvancedFieldsDisclosure } from "./Form.js";
import { CheckboxControl } from "./FormControls.js";
export function CompactCheckboxGroup({ className, label, name, onChange, options, summary, value, ...props }) {
    const selected = new Set(value);
    const count = options.filter((option) => selected.has(option.value)).length;
    return (_jsxs("fieldset", { ...props, className: ["od-compact-checkbox-group", className]
            .filter(Boolean)
            .join(" "), children: [_jsx("legend", { className: "od-visually-hidden", children: label }), _jsx(AdvancedFieldsDisclosure, { summary: summary ? summary(count) : `${label} (${String(count)} selected)`, onKeyDown: (event) => {
                    if (event.key !== "Escape" ||
                        event.defaultPrevented ||
                        !event.currentTarget.open)
                        return;
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.open = false;
                    event.currentTarget.querySelector("summary")?.focus();
                }, children: _jsx("div", { className: "od-compact-checkbox-group-options", children: options.map((option) => (_jsx(CheckboxControl, { checked: selected.has(option.value), disabled: option.disabled, form: props.form, label: option.label, name: name, onChange: (event) => {
                            const next = new Set(value);
                            if (event.currentTarget.checked)
                                next.add(option.value);
                            else
                                next.delete(option.value);
                            const ordered = [];
                            for (const item of options) {
                                if (next.has(item.value))
                                    ordered.push(item.value);
                            }
                            onChange(ordered);
                        }, value: option.value }, option.value))) }) })] }));
}
//# sourceMappingURL=CompactCheckboxGroup.js.map