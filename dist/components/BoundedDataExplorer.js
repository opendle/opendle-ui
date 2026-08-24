import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { ONTOLOGY_LABEL_LIMIT, ONTOLOGY_PAGE_LIMIT, assertBoundedItems, assertTextMaximum, assertUniqueIdentifiers, countOccurrences, validateOntologyRecordSummary, } from "../OntologyExplorerContract.js";
function validateRecords(items) {
    assertBoundedItems("Explorer records", items, ONTOLOGY_PAGE_LIMIT);
    assertUniqueIdentifiers("Explorer record key", items.map((item) => item.key));
    for (const item of items) {
        validateOntologyRecordSummary(item);
    }
}
/** A bounded current-record table. The host owns reads, paging, and actions. */
export function BoundedDataExplorer({ actions, className, description, empty, items, nextPage, onSelect, openLabel = (item) => `Open ${item.displayTitle}`, selectedKey, title, ...props }) {
    validateRecords(items);
    const titleId = useId();
    const descriptionId = useId();
    return (_jsxs("section", { ...props, "aria-describedby": description ? descriptionId : undefined, "aria-labelledby": titleId, className: ["od-data-explorer", className].filter(Boolean).join(" "), children: [_jsxs("header", { className: "od-data-explorer-heading", children: [_jsxs("div", { children: [_jsx("h2", { id: titleId, children: title }), description ? _jsx("p", { id: descriptionId, children: description }) : null] }), actions ? (_jsx("div", { className: "od-data-explorer-actions", children: actions })) : null] }), items.length === 0 ? (_jsx("output", { className: "od-data-explorer-empty", children: empty })) : (_jsx("div", { className: "od-data-explorer-table-wrap", children: _jsxs("table", { className: "od-data-explorer-table", children: [_jsx("caption", { className: "od-visually-hidden", children: typeof title === "string" ? title : "Current records" }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Record" }), _jsx("th", { scope: "col", children: "Kind" }), _jsx("th", { scope: "col", children: "Type" }), _jsx("th", { scope: "col", children: "Labels" }), _jsx("th", { scope: "col", children: "Properties" })] }) }), _jsx("tbody", { children: items.map((item) => (_jsxs("tr", { "data-selected": item.key === selectedKey, children: [_jsx("th", { scope: "row", children: onSelect ? (_jsxs("button", { "aria-label": openLabel(item), "aria-pressed": item.key === selectedKey, className: "od-data-explorer-open", onClick: () => {
                                                onSelect(item);
                                            }, type: "button", children: [_jsx("strong", { children: item.displayTitle }), _jsx("span", { children: item.key })] })) : (_jsxs("span", { className: "od-data-explorer-record", children: [_jsx("strong", { children: item.displayTitle }), _jsx("span", { children: item.key })] })) }), _jsx("td", { "data-label": "Kind", children: item.kind }), _jsx("td", { "data-label": "Type", children: _jsx("code", { children: item.type }) }), _jsx("td", { "data-label": "Labels", children: _jsx(OntologyLabelList, { labels: item.labels }) }), _jsx("td", { "data-label": "Properties", children: countOccurrences(item.properties) })] }, item.key))) })] }) })), nextPage ? (_jsx("footer", { className: "od-data-explorer-pagination", children: nextPage })) : null] }));
}
/** A bounded list for the plain string labels in the Ontology contract. */
export function OntologyLabelList({ className, emptyLabel = "None", labels, ...props }) {
    assertBoundedItems("Ontology labels", labels, ONTOLOGY_LABEL_LIMIT);
    assertUniqueIdentifiers("Ontology label", labels);
    for (const label of labels) {
        assertTextMaximum("Ontology label", label, 200);
    }
    return labels.length === 0 ? (_jsx("span", { className: "od-label-list-empty", children: emptyLabel })) : (_jsx("ul", { ...props, className: ["od-label-list", className].filter(Boolean).join(" "), children: labels.map((label) => (_jsx("li", { children: label }, label))) }));
}
//# sourceMappingURL=BoundedDataExplorer.js.map