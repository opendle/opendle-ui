import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
export function Button({ children, className, disabled, icon, loading = false, size = "default", type = "button", variant = "primary", ...props }) {
    return (_jsxs("button", { ...props, "aria-busy": loading || undefined, className: classes("od-button", `od-button-${variant}`, className), "data-loading": loading || undefined, "data-size": size, disabled: disabled === true || loading, type: type, children: [loading ? _jsx("span", { "aria-hidden": "true", className: "od-loading-ring" }) : icon, children] }));
}
//# sourceMappingURL=Button.js.map