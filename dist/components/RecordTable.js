import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { classes } from "./classes.js";
/** A plain table of records. The first cell of a row opens the record. */
export function RecordTable({ className, columns, label, onOpen, rows, }) {
    return (_jsx("div", { className: classes("od-record-table", className), children: _jsxs("table", { children: [_jsx("caption", { className: "od-visually-hidden", children: label }), _jsx("thead", { children: _jsx("tr", { children: columns.map((column) => (_jsx("th", { "data-numeric": column.numeric === true, scope: "col", children: column.label }, column.id))) }) }), _jsx("tbody", { children: rows.map((row) => (_jsxs("tr", { children: [_jsx("th", { scope: "row", children: onOpen === undefined ? (row.title) : (_jsx("button", { "aria-label": row.label, onClick: () => {
                                        onOpen(row.id);
                                    }, type: "button", children: row.title })) }), row.cells.map((cell, index) => {
                                const column = columns[index + 1];
                                return (_jsx("td", { "data-numeric": column?.numeric === true, children: cell }, column?.id));
                            })] }, row.id))) })] }) }));
}
//# sourceMappingURL=RecordTable.js.map