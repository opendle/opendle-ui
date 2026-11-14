import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { AutoGrowTextarea as BaseAutoGrowTextarea, } from "../components/AutoGrowTextarea.js";
import { classes } from "./classes.js";
/** A labelled one-line text input with an optional error message. */
export function TextField({ className, error = null, id, label, ...props }) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    return (_jsxs("div", { className: classes("pp-field", className), children: [_jsx("label", { className: "pp-field-label", htmlFor: inputId, children: label }), _jsx("input", { ...props, "aria-describedby": error === null ? undefined : errorId, "aria-invalid": error === null ? undefined : true, className: "pp-input", id: inputId }), error === null ? null : (_jsx("p", { className: "pp-field-error", id: errorId, children: error }))] }));
}
/** A textarea that grows with its content up to `maxHeight`. */
export function AutoGrowTextarea({ className, ...props }) {
    return (_jsx(BaseAutoGrowTextarea, { ...props, className: classes("pp-textarea", className) }));
}
//# sourceMappingURL=Fields.js.map