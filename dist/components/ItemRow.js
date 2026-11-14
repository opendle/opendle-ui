import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function ItemRow({ actions, icon, meta, title }) {
    return (_jsxs("li", { className: "od-list-row", children: [icon ? _jsx("span", { className: "od-list-icon", children: icon }) : null, _jsxs("span", { className: "od-list-copy", children: [_jsx("span", { className: "od-list-title", children: title }), meta ? _jsx("span", { className: "od-list-meta", children: meta }) : null] }), actions] }));
}
//# sourceMappingURL=ItemRow.js.map