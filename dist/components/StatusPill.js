import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { StatusDot } from "./StatusDot.js";
export function StatusPill({ tone, children, className }) {
    return (_jsxs("span", { className: ["od-status-pill", `od-status-${tone}`, className]
            .filter(Boolean)
            .join(" "), children: [_jsx(StatusDot, { tone: tone }), children] }));
}
//# sourceMappingURL=StatusPill.js.map