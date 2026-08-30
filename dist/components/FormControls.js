import { jsx as _jsx } from "react/jsx-runtime";
import { FormField } from "./Form.js";
function controlClassName(name, className) {
    return ["od-form-control", name, className].filter(Boolean).join(" ");
}
function isControlRequired(required, requirement) {
    return required === true || requirement === "required";
}
function requirementProps(required, requirement) {
    const value = isControlRequired(required, requirement)
        ? "required"
        : requirement;
    return value ? { requirement: value } : {};
}
export function TextControl({ className, controlClassName: controlClass, error, help, label, onChange, requirement, required, ...props }) {
    return (_jsx(FormField, { className: ["od-text-control", className].filter(Boolean).join(" "), error: error, help: help, label: label, ...requirementProps(required, requirement), children: _jsx("input", { ...props, className: controlClassName("od-text-control-input", controlClass), onChange: onChange, required: isControlRequired(required, requirement), type: "text" }) }));
}
export function NumberControl({ className, controlClassName: controlClass, error, help, label, requirement, required, ...props }) {
    return (_jsx(FormField, { className: ["od-number-control", className].filter(Boolean).join(" "), error: error, help: help, label: label, ...requirementProps(required, requirement), children: _jsx("input", { ...props, className: controlClassName("od-number-control-input", controlClass), required: isControlRequired(required, requirement), type: "number" }) }));
}
export function SelectControl({ children, className, controlClassName: controlClass, error, help, label, requirement, required, ...props }) {
    return (_jsx(FormField, { className: ["od-select-control", className].filter(Boolean).join(" "), error: error, help: help, label: label, ...requirementProps(required, requirement), children: _jsx("select", { ...props, className: controlClassName("od-select-control-input", controlClass), required: isControlRequired(required, requirement), children: children }) }));
}
export function TextareaControl({ className, controlClassName: controlClass, error, help, label, requirement, required, ...props }) {
    return (_jsx(FormField, { className: ["od-textarea-control", className].filter(Boolean).join(" "), error: error, help: help, label: label, ...requirementProps(required, requirement), children: _jsx("textarea", { ...props, className: controlClassName("od-textarea-control-input", controlClass), required: isControlRequired(required, requirement) }) }));
}
export function CheckboxControl({ checked, className, controlClassName: controlClass, error, help, label, onChange, requirement, required, ...props }) {
    return (_jsx(FormField, { className: ["od-checkbox-control", className].filter(Boolean).join(" "), error: error, help: help, label: label, orientation: "inline", ...requirementProps(required, requirement), children: _jsx("input", { ...props, checked: checked, className: controlClassName("od-checkbox-control-input", controlClass), onChange: onChange, required: isControlRequired(required, requirement), type: "checkbox" }) }));
}
export function SwitchControl({ checked, className, controlClassName: controlClass, error, help, label, onChange, requirement, required, ...props }) {
    return (_jsx(FormField, { className: ["od-switch-control", className].filter(Boolean).join(" "), error: error, help: help, label: label, orientation: "inline", ...requirementProps(required, requirement), children: _jsx("input", { ...props, "aria-checked": checked, checked: checked, className: controlClassName("od-switch-control-input", controlClass), onChange: onChange, required: isControlRequired(required, requirement), role: "switch", type: "checkbox" }) }));
}
//# sourceMappingURL=FormControls.js.map