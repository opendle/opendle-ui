import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId } from "react";
import { ONTOLOGY_PAGE_LIMIT, assertBoundedItems, assertIdentifier, assertTextMaximum, assertUniqueIdentifiers, validateOntologyMetadataBag, validateOntologyRecordSummary, } from "../OntologyExplorerContract.js";
import { OntologyLabelList } from "./BoundedDataExplorer.js";
function itemIdentifier(item) {
    return item.kind === "metadata_bag" ? item.bag.id : item.record.key;
}
function itemTitle(item) {
    if (item.kind === "metadata_bag") {
        return item.bag.source === undefined || item.bag.source === ""
            ? item.bag.id
            : item.bag.source;
    }
    return item.record.displayTitle;
}
function itemTime(item) {
    return item.kind === "metadata_bag"
        ? item.bag.updatedAt
        : item.record.timestamps?.updatedAt;
}
/** A bounded current-state change list. It does not represent a durable history. */
export function ChangeTimeline({ className, description, empty, items, nextPage, onSelect, title, ...props }) {
    assertBoundedItems("Current changes", items, ONTOLOGY_PAGE_LIMIT);
    assertUniqueIdentifiers("Current change identifier", items.map((item) => `${item.kind}:${itemIdentifier(item)}`));
    for (const item of items) {
        assertIdentifier("Current change identifier", itemIdentifier(item));
        assertTextMaximum("Current change identifier", itemIdentifier(item), 200);
        assertIdentifier("Current change title", itemTitle(item));
        assertTextMaximum("Current change title", itemTitle(item), 1_000);
        if (item.kind === "metadata_bag") {
            validateOntologyMetadataBag(item.bag);
        }
        else {
            validateOntologyRecordSummary(item.record, item.kind);
        }
    }
    const titleId = useId();
    const descriptionId = useId();
    return (_jsxs("section", { ...props, "aria-describedby": description ? descriptionId : undefined, "aria-labelledby": titleId, className: ["od-change-timeline", className].filter(Boolean).join(" "), children: [_jsxs("header", { className: "od-change-timeline-heading", children: [_jsx("h2", { id: titleId, children: title }), description ? _jsx("p", { id: descriptionId, children: description }) : null] }), items.length === 0 ? (_jsx("output", { className: "od-change-timeline-empty", children: empty })) : (_jsx("ol", { "aria-label": "Current changed records", className: "od-change-timeline-list", children: items.map((item) => {
                    const identifier = itemIdentifier(item);
                    const time = itemTime(item);
                    const content = (_jsxs(_Fragment, { children: [_jsx("span", { className: "od-change-timeline-mark" }), _jsxs("span", { className: "od-change-timeline-copy", children: [_jsx("span", { className: "od-change-timeline-kind", children: item.kind === "metadata_bag" ? "Metadata bag" : item.kind }), _jsx("strong", { children: itemTitle(item) }), _jsx("code", { children: identifier }), item.kind === "metadata_bag" ? null : (_jsx(OntologyLabelList, { labels: item.record.labels }))] }), time ? _jsx("time", { dateTime: time, children: time }) : null] }));
                    return (_jsx("li", { children: onSelect ? (_jsx("button", { "aria-label": `Open ${itemTitle(item)}`, onClick: () => {
                                onSelect(item);
                            }, type: "button", children: content })) : (_jsx("article", { children: content })) }, `${item.kind}:${identifier}`));
                }) })), nextPage ? (_jsx("footer", { className: "od-change-timeline-pagination", children: nextPage })) : null] }));
}
//# sourceMappingURL=ChangeTimeline.js.map