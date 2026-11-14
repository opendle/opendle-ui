import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** The signed-in person at the end of the sidebar. */
export function SidebarAccount({ active = false, avatar, className, name, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: classes("pp-sidebar-account", className), title: name, children: [avatar, _jsx("span", { className: "pp-sidebar-label", children: name })] }));
}
//# sourceMappingURL=SidebarAccount.js.map