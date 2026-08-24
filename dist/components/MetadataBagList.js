import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId } from "react";
import { ONTOLOGY_PAGE_LIMIT, assertBoundedItems, assertUniqueIdentifiers, validateOntologyMetadataBag, } from "../OntologyExplorerContract.js";
function bagContext(bag) {
    const items = [];
    if (bag.source)
        items.push(["Source", bag.source]);
    if (bag.at)
        items.push(["At", bag.at]);
    if (bag.from)
        items.push(["From", bag.from]);
    if (bag.to)
        items.push(["To", bag.to]);
    if (bag.location) {
        items.push([
            "Location",
            `${String(bag.location.latitude)}, ${String(bag.location.longitude)}`,
        ]);
    }
    return items;
}
/** A bounded list for shared current metadata contexts. */
export function MetadataBagList({ bags, className, description, empty, nextPage, onSelect, selectedId, title, ...props }) {
    assertBoundedItems("Metadata bags", bags, ONTOLOGY_PAGE_LIMIT);
    assertUniqueIdentifiers("Metadata bag identifier", bags.map((bag) => bag.id));
    for (const bag of bags) {
        validateOntologyMetadataBag(bag);
    }
    const titleId = useId();
    const descriptionId = useId();
    return (_jsxs("section", { ...props, "aria-describedby": description ? descriptionId : undefined, "aria-labelledby": titleId, className: ["od-metadata-bags", className].filter(Boolean).join(" "), children: [_jsxs("header", { className: "od-metadata-bags-heading", children: [_jsx("h2", { id: titleId, children: title }), description ? _jsx("p", { id: descriptionId, children: description }) : null] }), bags.length === 0 ? (_jsx("output", { className: "od-metadata-bags-empty", children: empty })) : (_jsx("ul", { className: "od-metadata-bag-list", children: bags.map((bag) => {
                    const context = bagContext(bag);
                    const content = (_jsxs(_Fragment, { children: [_jsxs("span", { className: "od-metadata-bag-title", children: [_jsx("strong", { children: bag.source === undefined || bag.source === ""
                                            ? bag.id
                                            : bag.source }), _jsx("code", { children: bag.id })] }), _jsx("dl", { children: context.map(([label, value]) => (_jsxs("div", { children: [_jsx("dt", { children: label }), _jsx("dd", { children: value })] }, label))) })] }));
                    return (_jsx("li", { "data-selected": selectedId === bag.id, children: onSelect ? (_jsx("button", { "aria-label": `Open metadata bag ${bag.source === undefined || bag.source === "" ? bag.id : bag.source}`, "aria-pressed": selectedId === bag.id, onClick: () => {
                                onSelect(bag);
                            }, type: "button", children: content })) : (_jsx("article", { children: content })) }, bag.id));
                }) })), nextPage ? (_jsx("footer", { className: "od-metadata-bags-pagination", children: nextPage })) : null] }));
}
//# sourceMappingURL=MetadataBagList.js.map