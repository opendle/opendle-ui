import { jsx as _jsx } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** A bordered surface. */
export function Card({ children, className, padded = false, ...props }) {
    return (_jsx("section", { ...props, className: classes("od-card", className), "data-padded": padded, children: children }));
}
//# sourceMappingURL=Card.js.map