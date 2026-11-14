import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
export function IconButton({ className, icon, label, tone = "default", type = "button", ...props }) {
    return (_jsx("button", { ...props, ...(label === undefined ? {} : { "aria-label": label, title: label }), className: classes("od-icon-button", className), "data-tone": tone, type: type, children: icon }));
}
//# sourceMappingURL=IconButton.js.map