import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AttentionRow({ action, className, detail, icon, meta, title, tone = "slate", type = "button", ...props }) {
    return (_jsxs("button", { ...props, className: ["od-attention-row", className].filter(Boolean).join(" "), "data-tone": tone, type: type, children: [_jsx("span", { className: "od-attention-icon", children: icon }), _jsxs("span", { className: "od-attention-copy", children: [_jsx("strong", { children: title }), detail ? _jsx("small", { children: detail }) : null] }), meta ? _jsx("span", { className: "od-attention-meta", children: meta }) : null, action ? _jsx("span", { className: "od-attention-action", children: action }) : null] }));
}
//# sourceMappingURL=AttentionRow.js.map