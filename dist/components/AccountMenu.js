import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AccountMenu({ avatar, className, detail, end, name, compact = false, type = "button", ...props }) {
    return (_jsxs("button", { ...props, className: ["od-account-menu", className].filter(Boolean).join(" "), "data-compact": compact, type: type, children: [_jsx("span", { className: "od-account-avatar", children: avatar }), _jsxs("span", { className: "od-account-copy", "data-hidden": compact, children: [_jsx("strong", { children: name }), detail ? _jsx("small", { children: detail }) : null] }), end ? _jsx("span", { className: "od-account-end", children: end }) : null] }));
}
//# sourceMappingURL=AccountMenu.js.map