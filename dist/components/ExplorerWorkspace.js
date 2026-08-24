import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
import { ONTOLOGY_PAGE_LIMIT, assertBoundedItems, assertIdentifier, assertTextMaximum, } from "../OntologyExplorerContract.js";
/** A reusable explorer shell. Hosts own route changes, data, and copy. */
export function ExplorerWorkspace({ actions, activeItem, children, className, description, inspector, navigationItems, navigationLabel, onSelect, title, ...props }) {
    const titleId = useId();
    assertBoundedItems("Explorer navigation items", navigationItems, ONTOLOGY_PAGE_LIMIT);
    const ids = new Set();
    for (const item of navigationItems) {
        assertIdentifier("Explorer navigation identifier", item.id);
        if (ids.has(item.id)) {
            throw new TypeError("Explorer navigation identifiers must be non-empty and unique.");
        }
        assertTextMaximum("Explorer navigation identifier", item.id, 200);
        if (item.count !== undefined &&
            (!Number.isSafeInteger(item.count) || item.count < 0)) {
            throw new RangeError("Explorer navigation counts must be non-negative integers.");
        }
        ids.add(item.id);
    }
    if (!ids.has(activeItem)) {
        throw new TypeError("The active explorer item must exist in the navigation.");
    }
    return (_jsxs("section", { ...props, "aria-labelledby": titleId, className: ["od-explorer-workspace", className].filter(Boolean).join(" "), children: [_jsxs("header", { className: "od-explorer-workspace-heading", children: [_jsxs("div", { children: [_jsx("h1", { id: titleId, children: title }), description ? _jsx("p", { children: description }) : null] }), actions ? (_jsx("div", { className: "od-explorer-workspace-actions", children: actions })) : null] }), _jsx("nav", { "aria-label": navigationLabel, className: "od-explorer-navigation", children: navigationItems.map((item) => (_jsxs("button", { "aria-current": item.id === activeItem ? "page" : undefined, disabled: item.disabled, onClick: () => {
                        onSelect(item.id);
                    }, type: "button", children: [_jsx("span", { children: item.label }), item.count === undefined ? null : _jsx("strong", { children: item.count })] }, item.id))) }), _jsxs("div", { className: "od-explorer-workspace-body", children: [_jsx("div", { className: "od-explorer-workspace-content", children: children }), inspector ? (_jsx("aside", { "aria-label": "Selected item details", className: "od-explorer-workspace-inspector", children: inspector })) : null] })] }));
}
/** A live state message for bounded resource loading and recovery. */
export function ExplorerState({ action, className, description, state, title, ...props }) {
    const titleId = useId();
    return (_jsxs("div", { ...props, "aria-labelledby": titleId, "aria-live": state === "error" || state === "offline" ? "assertive" : "polite", "aria-busy": state === "loading" || state === "recovering", className: ["od-explorer-state", className].filter(Boolean).join(" "), "data-state": state, role: state === "error" || state === "offline" ? "alert" : "status", children: [_jsx("span", { "aria-hidden": "true", className: "od-explorer-state-mark" }), _jsxs("div", { children: [_jsx("h2", { id: titleId, children: title }), _jsx("div", { className: "od-explorer-state-description", children: description })] }), action ? _jsx("div", { className: "od-explorer-state-action", children: action }) : null] }));
}
//# sourceMappingURL=ExplorerWorkspace.js.map