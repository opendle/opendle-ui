import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
const isEmpty = (node) => node === undefined || node === null;
/**
 * The one toolbar of a list view: tabs, then filters, then search. When the
 * row has no room, the tabs stay above the content and the filters and the
 * search go on the line above them. A narrow toolbar puts each part on its
 * own line.
 */
export function FilterToolbar({ children, className, end, start, }) {
    const hasTabs = !isEmpty(start);
    return (_jsx("div", { className: classes("od-filter-toolbar", className), "data-tabs": hasTabs, children: _jsxs("div", { className: "od-filter-toolbar-row", children: [hasTabs ? _jsx("div", { className: "od-filter-toolbar-tabs", children: start }) : null, _jsxs("div", { className: "od-filter-toolbar-controls", children: [_jsx("div", { className: "od-filter-toolbar-filters", children: children }), isEmpty(end) ? null : (_jsx("div", { className: "od-filter-toolbar-search", children: end }))] })] }) }));
}
//# sourceMappingURL=FilterToolbar.js.map