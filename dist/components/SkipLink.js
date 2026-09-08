import { jsx as _jsx } from "react/jsx-runtime";
/** A focus-revealed native link to a host-owned content target. */
export function SkipLink({ className, label, ...props }) {
    return (_jsx("a", { ...props, className: ["od-skip-link", className].filter(Boolean).join(" "), children: label }));
}
//# sourceMappingURL=SkipLink.js.map