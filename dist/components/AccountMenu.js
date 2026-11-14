import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** The signed-in person at the end of the application sidebar. */
export function AccountMenu({ active = false, avatar, className, name, ...props }) {
    return (_jsxs("a", { ...props, "aria-current": active ? "page" : undefined, className: classes("od-account-menu", className), title: name, children: [avatar, _jsx("span", { className: "od-navigation-label", children: name })] }));
}
//# sourceMappingURL=AccountMenu.js.map