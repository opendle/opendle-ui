import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { classes } from "./classes.js";
export function PageHeading({ actions, className, title }) {
    return (_jsxs("header", { className: classes("pp-page-heading", className), children: [_jsx("h1", { children: title }), actions ? (_jsx("div", { className: "pp-page-heading-actions", children: actions })) : null] }));
}
/** A titled part of a page. */
export function Section({ actions, children, className, title }) {
    const headingId = useId();
    return (_jsxs("section", { "aria-labelledby": headingId, className: classes("pp-section", className), children: [_jsxs("div", { className: "pp-section-heading", children: [_jsx("h2", { id: headingId, children: title }), actions] }), children] }));
}
/** A bordered surface. */
export function Card({ children, className, padded = false }) {
    return (_jsx("div", { className: classes("pp-card", className), "data-padded": padded, children: children }));
}
/** A list of `ItemRow` elements with hairline separators. */
export function ItemList({ children, className, empty }) {
    const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
    if (!hasRows && empty !== undefined) {
        return _jsx("p", { className: "pp-list-empty", children: empty });
    }
    return _jsx("ul", { className: classes("pp-list", className), children: children });
}
export function ItemRow({ actions, icon, meta, title }) {
    return (_jsxs("li", { className: "pp-list-row", children: [icon ? _jsx("span", { className: "pp-list-icon", children: icon }) : null, _jsxs("span", { className: "pp-list-copy", children: [_jsx("span", { className: "pp-list-title", children: title }), meta ? _jsx("span", { className: "pp-list-meta", children: meta }) : null] }), actions] }));
}
//# sourceMappingURL=Page.js.map