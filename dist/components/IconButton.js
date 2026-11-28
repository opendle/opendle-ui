import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { classes } from "./classes.js";
export function IconButton({ className, disabled, disabledReason, icon, label, tone = "default", type = "button", ...props }) {
    const reasonId = useId();
    const reason = disabledReason === undefined || disabledReason === ""
        ? null
        : disabledReason;
    return (_jsxs("button", { ...props, ...(label === undefined ? {} : { "aria-label": label, title: label }), ...(reason === null
            ? { disabled }
            : {
                "aria-describedby": reasonId,
                "data-reason": "",
                disabled: true,
                title: reason,
            }), className: classes("od-icon-button", className), "data-tone": tone, type: type, children: [icon, reason === null ? null : (_jsx("span", { hidden: true, id: reasonId, children: reason }))] }));
}
//# sourceMappingURL=IconButton.js.map