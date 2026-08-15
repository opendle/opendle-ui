import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ChainStep({ className, detail, number, status, title, tone, }) {
    return (_jsxs("div", { className: ["od-chain-step", "chain-step", tone === "lime" ? "od-chain-step-current current" : null, className].filter(Boolean).join(" "), children: [_jsx("span", { children: number }), _jsxs("div", { children: [_jsx("strong", { children: title }), _jsx("small", { children: detail })] }), _jsxs("span", { className: ["od-status-pill", `od-status-${tone}`].join(" "), children: [_jsx("span", { "aria-hidden": "true", className: "od-status-dot" }), status] })] }));
}
//# sourceMappingURL=ChainStep.js.map