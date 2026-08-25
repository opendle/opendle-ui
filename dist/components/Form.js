import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cloneElement, isValidElement, useId, } from "react";
function joinIds(...ids) {
    const value = ids.filter(Boolean).join(" ");
    return value || undefined;
}
function hasContent(value) {
    return value !== undefined && value !== null && value !== false;
}
export function FieldHelp({ children, className, ...props }) {
    return (_jsx("p", { ...props, className: ["od-field-help", className].filter(Boolean).join(" "), children: children }));
}
export function FieldError({ children, className, role = "alert", ...props }) {
    return (_jsx("p", { ...props, className: ["od-field-error", className].filter(Boolean).join(" "), role: role, children: children }));
}
export function FormField({ children, className, controlId, error, help, label, orientation = "stacked", requirement, ...props }) {
    const generatedControlId = useId();
    const generatedHelpId = useId();
    const generatedErrorId = useId();
    if (!isValidElement(children)) {
        throw new Error("FormField requires one control element.");
    }
    const id = children.props.id ?? controlId ?? generatedControlId;
    const helpId = hasContent(help) ? generatedHelpId : undefined;
    const errorId = hasContent(error) ? generatedErrorId : undefined;
    const describedBy = joinIds(children.props["aria-describedby"], helpId, errorId);
    const controlAccessibilityProps = {
        id,
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        ...(errorId
            ? { "aria-invalid": true }
            : children.props["aria-invalid"] !== undefined
                ? { "aria-invalid": children.props["aria-invalid"] }
                : {}),
    };
    const control = cloneElement(children, controlAccessibilityProps);
    return (_jsxs("div", { ...props, className: ["od-form-field", className].filter(Boolean).join(" "), "data-orientation": orientation, children: [_jsxs("div", { className: "od-form-field-heading", children: [_jsx("label", { className: "od-form-field-label", htmlFor: id, children: label }), requirement ? (_jsx("span", { "aria-hidden": "true", className: "od-form-field-requirement", children: requirement })) : null] }), _jsx("div", { className: "od-form-field-control", children: control }), helpId ? _jsx(FieldHelp, { id: helpId, children: help }) : null, errorId ? _jsx(FieldError, { id: errorId, children: error }) : null] }));
}
export function FormActions({ alignment = "end", children, className, ...props }) {
    return (_jsx("div", { ...props, className: ["od-form-actions", className].filter(Boolean).join(" "), "data-alignment": alignment, children: children }));
}
export function FormSection({ actions, children, className, columns = 1, description, legend, ...props }) {
    const descriptionId = useId();
    const describedBy = description
        ? joinIds(props["aria-describedby"], descriptionId)
        : props["aria-describedby"];
    return (_jsxs("fieldset", { ...props, "aria-describedby": describedBy, className: ["od-form-section", className].filter(Boolean).join(" "), children: [_jsx("legend", { children: legend }), description ? (_jsx("p", { className: "od-form-section-description", id: descriptionId, children: description })) : null, _jsx("div", { className: "od-form-section-fields", "data-columns": columns, children: children }), actions ? _jsx(FormActions, { children: actions }) : null] }));
}
export function AdvancedFieldsDisclosure({ children, className, description, summary = "Advanced fields", ...props }) {
    return (_jsxs("details", { ...props, className: ["od-advanced-fields", className].filter(Boolean).join(" "), children: [_jsx("summary", { children: summary }), _jsxs("div", { className: "od-advanced-fields-content", children: [description ? (_jsx("p", { className: "od-advanced-fields-description", children: description })) : null, children] })] }));
}
//# sourceMappingURL=Form.js.map