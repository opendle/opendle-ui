import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, } from "react";
import { FieldError, FieldHelp } from "./Form.js";
function RadioChoice({ option, checked, name, form, describedBy, onChange, }) {
    const id = useId();
    return (_jsxs("label", { className: "od-radio-group-choice", htmlFor: id, onFocus: (event) => {
            event.currentTarget.scrollIntoView({
                block: "nearest",
                inline: "nearest",
            });
        }, children: [_jsx("input", { "aria-describedby": describedBy, "aria-labelledby": `${id}-label`, checked: checked, className: "od-form-control od-radio-group-input", disabled: option.disabled, form: form, id: id, name: name, onChange: () => {
                    onChange(option.value);
                }, type: "radio", value: option.value }), _jsx("span", { className: "od-radio-group-choice-label", id: `${id}-label`, children: option.label })] }));
}
export function RadioGroup({ className, error, help, label, name, options, value, onChange, ...props }) {
    const id = useId();
    const helpId = help !== undefined && help !== null && help !== false
        ? `${id}-help`
        : undefined;
    const errorId = error !== undefined && error !== null && error !== false
        ? `${id}-error`
        : undefined;
    const describedBy = [props["aria-describedby"], helpId, errorId].filter(Boolean).join(" ") ||
        undefined;
    const invalid = errorId ? true : props["aria-invalid"];
    return (_jsxs("fieldset", { ...props, "aria-describedby": describedBy, "aria-invalid": invalid, className: ["od-radio-group", className].filter(Boolean).join(" "), children: [_jsx("legend", { className: "od-form-field-label", children: label }), helpId ? _jsx(FieldHelp, { id: helpId, children: help }) : null, _jsx("div", { className: "od-radio-group-options", "data-scrollable": options.length > 6 || undefined, children: options.map((option) => (_jsx(RadioChoice, { option: option, checked: value === option.value, name: name ?? id, form: props.form, describedBy: describedBy, onChange: onChange }, option.value))) }), errorId ? _jsx(FieldError, { id: errorId, children: error }) : null] }));
}
//# sourceMappingURL=RadioGroup.js.map