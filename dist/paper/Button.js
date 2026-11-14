import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
export function Button({ children, className, icon, size = "default", type = "button", variant = "secondary", ...props }) {
    return (_jsxs("button", { ...props, className: classes("pp-button", className), "data-size": size, "data-variant": variant, type: type, children: [icon, children] }));
}
export function IconButton({ className, icon, label, tone = "default", type = "button", ...props }) {
    return (_jsx("button", { ...props, "aria-label": label, className: classes("pp-icon-button", className), "data-tone": tone, title: label, type: type, children: icon }));
}
//# sourceMappingURL=Button.js.map