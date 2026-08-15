import { jsx as _jsx } from "react/jsx-runtime";
export function Card({ children, className, ...props }) {
    return (_jsx("section", { ...props, className: ["od-card", className].filter(Boolean).join(" "), children: children }));
}
//# sourceMappingURL=Card.js.map