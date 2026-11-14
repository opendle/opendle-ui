import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { classes } from "./classes.js";
/** A titled part of a page. */
export function Section({ actions, children, className, title }) {
    const headingId = useId();
    return (_jsxs("section", { "aria-labelledby": headingId, className: classes("od-section", className), children: [_jsxs("div", { className: "od-section-heading", children: [_jsx("h2", { id: headingId, children: title }), actions] }), children] }));
}
//# sourceMappingURL=Section.js.map