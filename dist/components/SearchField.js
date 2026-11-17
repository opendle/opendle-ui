import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { Icon } from "./Icon.js";
/** A compact search input with a search icon, for a toolbar or a list header. */
export function SearchField({ className, label, placeholder, ref, ...props }) {
    return (_jsxs("span", { className: classes("od-search-field", className), children: [_jsx(Icon, { name: "search", size: 16 }), _jsx("input", { ...props, "aria-label": label, placeholder: placeholder ?? label, ref: ref, type: "search" })] }));
}
//# sourceMappingURL=SearchField.js.map