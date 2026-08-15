import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function WorkspaceSelector({ avatar, className, detail, end, name, type = "button", ...props }) {
    return (_jsxs("button", { ...props, className: ["od-workspace-selector", className].filter(Boolean).join(" "), type: type, children: [_jsx("span", { className: "od-workspace-avatar", children: avatar }), _jsxs("span", { className: "od-workspace-copy", children: [_jsx("strong", { children: name }), detail ? _jsx("small", { children: detail }) : null] }), end ? _jsx("span", { className: "od-workspace-end", children: end }) : null] }));
}
//# sourceMappingURL=WorkspaceSelector.js.map