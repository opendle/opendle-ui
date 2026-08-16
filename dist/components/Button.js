import { jsxs as _jsxs } from "react/jsx-runtime";
export function Button({ children, className, icon, type = "button", variant = "primary", ...props }) {
    return (_jsxs("button", { ...props, className: ["od-button", `od-button-${variant}`, className]
            .filter(Boolean)
            .join(" "), type: type, children: [icon, children] }));
}
//# sourceMappingURL=Button.js.map