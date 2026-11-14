import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** A list of `ItemRow` elements with hairline separators. */
export function ItemList({ children, className, empty }) {
    const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
    if (!hasRows && empty !== undefined) {
        return _jsx("p", { className: "od-list-empty", children: empty });
    }
    return _jsx("ul", { className: classes("od-list", className), children: children });
}
//# sourceMappingURL=ItemList.js.map