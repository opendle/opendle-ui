import { jsx as _jsx } from "react/jsx-runtime";
export function IconButton({ className, icon, type = "button", ...props }) {
    return (_jsx("button", { ...props, className: ["od-icon-button", className].filter(Boolean).join(" "), type: type, children: icon }));
}
//# sourceMappingURL=IconButton.js.map