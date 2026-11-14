import { jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
export function Button({ children, className, icon, size = "default", type = "button", variant = "primary", ...props }) {
    return (_jsxs("button", { ...props, className: classes("od-button", `od-button-${variant}`, className), "data-size": size, type: type, children: [icon, children] }));
}
//# sourceMappingURL=Button.js.map