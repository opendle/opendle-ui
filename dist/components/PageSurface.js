import { jsx as _jsx } from "react/jsx-runtime";
/** One full-width page boundary with a shared responsive gutter mode. */
export function PageSurface({ children, className, edgeToEdge = false, ...props }) {
    return (_jsx("div", { ...props, className: ["od-page-surface", className].filter(Boolean).join(" "), "data-edge-to-edge": edgeToEdge, children: children }));
}
//# sourceMappingURL=PageSurface.js.map