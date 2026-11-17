import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
import { PanelContent } from "./PanelContent.js";
/** A plain table of records. The first cell of a row opens the record. */
export function RecordTable({ className, columns, label, minimumWidth, onOpen, rows, }) {
    const fixed = columns.some((column) => column.width !== undefined);
    return (_jsx(PanelContent, { "aria-label": `${label} scrollable table`, className: classes("od-record-table", className), children: _jsxs("table", { "data-layout": fixed ? "fixed" : undefined, style: minimumWidth === undefined ? undefined : { minWidth: minimumWidth }, children: [_jsx("caption", { className: "od-visually-hidden", children: label }), fixed ? (_jsx("colgroup", { children: columns.map((column) => (_jsx("col", { style: { width: column.width } }, column.id))) })) : null, _jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { "data-numeric": column.numeric === true, scope: "col", children: column.label }, column.id))) }) }), _jsx("tbody", { children: rows.map((row) => (_jsxs("tr", { children: [_jsx("th", { scope: "row", children: onOpen === undefined ? (row.title) : (_jsx("button", { "aria-label": row.label, onClick: () => {
                                        onOpen(row.id);
                                    }, type: "button", children: row.title })) }), row.cells.map((cell, index) => {
                                const column = columns[index + 1];
                                return (_jsx("td", { "data-numeric": column?.numeric === true, children: cell }, column?.id));
                            })] }, row.id))) })] }) }));
}
//# sourceMappingURL=RecordTable.js.map