import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Panel({ children, className, ...props }) {
    return (_jsx("section", { ...props, className: ["od-panel", className].filter(Boolean).join(" "), children: children }));
}
export function PanelHeader({ actions, className, description, kicker, title, ...props }) {
    return (_jsxs("header", { ...props, className: ["od-panel-header", className].filter(Boolean).join(" "), children: [_jsxs("div", { children: [kicker ? _jsx("p", { className: "od-panel-kicker", children: kicker }) : null, _jsx("h2", { children: title }), description ? _jsx("p", { children: description }) : null] }), actions ? _jsx("div", { className: "od-panel-actions", children: actions }) : null] }));
}
//# sourceMappingURL=Panel.js.map