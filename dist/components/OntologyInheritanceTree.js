import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useId } from "react";
import { ONTOLOGY_TYPE_LIMIT, assertApiName, assertBoundedItems, assertIdentifier, assertTextMaximum, assertUniqueIdentifiers, } from "../OntologyExplorerContract.js";
import { layoutLayeredDirectedGraph, treeEdgePath } from "../GraphLayout.js";
import { GraphEdge, GraphEdges, GraphNode, GraphViewport, } from "./GraphWorkspace.js";
function layoutDefinitions(definitions) {
    const result = layoutLayeredDirectedGraph(definitions.map((definition) => ({
        id: definition.apiName,
        parentIds: definition.parentTypes,
    })), { horizontalGap: 72, padding: 48, verticalGap: 48 });
    return {
        ...result,
        height: Math.max(420, result.height),
        width: Math.max(760, result.width),
    };
}
/** A top-to-bottom view of additive object-type inheritance. */
export function OntologyInheritanceTree({ className, definitions, description, empty, onSelect, selectedApiName, title, ...props }) {
    assertBoundedItems("Ontology type definitions", definitions, ONTOLOGY_TYPE_LIMIT);
    assertUniqueIdentifiers("Ontology type API name", definitions.map((definition) => definition.apiName));
    const names = new Set(definitions.map((definition) => definition.apiName));
    for (const definition of definitions) {
        assertApiName("Ontology type API name", definition.apiName);
        assertIdentifier("Ontology type title", definition.title);
        assertTextMaximum("Ontology type title", definition.title, 200);
        assertBoundedItems("Ontology parent types", definition.parentTypes, 20);
        assertUniqueIdentifiers("Ontology parent type", definition.parentTypes);
        for (const parent of definition.parentTypes) {
            assertApiName("Ontology parent type", parent);
        }
        if (definition.parentTypes.some((parent) => !names.has(parent))) {
            throw new TypeError("An ontology parent type is absent from the input.");
        }
    }
    const titleId = useId();
    const descriptionId = useId();
    const layout = layoutDefinitions(definitions);
    const positionById = new Map(layout.nodes.map((node) => [node.id, node]));
    return (_jsxs("section", { ...props, "aria-describedby": description ? descriptionId : undefined, "aria-labelledby": titleId, className: ["od-ontology-tree", className].filter(Boolean).join(" "), children: [_jsxs("header", { className: "od-ontology-tree-heading", children: [_jsx("h2", { id: titleId, children: title }), description ? _jsx("p", { id: descriptionId, children: description }) : null] }), definitions.length === 0 ? (_jsx("output", { className: "od-ontology-tree-empty", children: empty })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "od-ontology-tree-graph", children: _jsxs(GraphViewport, { "aria-label": "Top-to-bottom ontology inheritance graph", canvasHeight: layout.height, canvasProps: { "aria-label": "Object types and inheritance" }, canvasWidth: layout.width, children: [_jsx(GraphEdges, { "aria-label": "Inheritance relationships", role: "group", children: layout.edges.map((edge) => {
                                        const start = positionById.get(edge.sourceId);
                                        const end = positionById.get(edge.targetId);
                                        return start && end ? (_jsx(GraphEdge, { path: treeEdgePath(start, end) }, edge.id)) : null;
                                    }) }), definitions.map((definition) => {
                                    const position = positionById.get(definition.apiName);
                                    if (!position)
                                        return null;
                                    const relationship = definition.parentTypes.length === 0
                                        ? "Root type"
                                        : `Parents: ${definition.parentTypes.join(", ")}`;
                                    return (_jsx(GraphNode, { "aria-label": onSelect
                                            ? `Open ${definition.title}. ${relationship}`
                                            : `${definition.title}. ${relationship}`, disabled: !onSelect, eyebrow: definition.deprecated
                                            ? "Deprecated type"
                                            : definition.inherited
                                                ? "Inherited type"
                                                : "Local type", meta: definition.apiName, onClick: onSelect
                                            ? () => {
                                                onSelect(definition);
                                            }
                                            : undefined, root: definition.parentTypes.length === 0, selected: selectedApiName === definition.apiName, title: definition.title, tone: definition.deprecated ? "amber" : "blue", x: position.x, y: position.y }, definition.apiName));
                                })] }) }), _jsx("ol", { className: "od-ontology-tree-list", children: definitions.map((definition) => (_jsxs("li", { children: [onSelect ? (_jsxs("button", { "aria-pressed": selectedApiName === definition.apiName, onClick: () => {
                                        onSelect(definition);
                                    }, type: "button", children: [_jsx("strong", { children: definition.title }), _jsx("code", { children: definition.apiName })] })) : (_jsxs("span", { children: [_jsx("strong", { children: definition.title }), _jsx("code", { children: definition.apiName })] })), _jsx("span", { children: definition.parentTypes.length === 0
                                        ? "Root type"
                                        : `Parents: ${definition.parentTypes.join(", ")}` })] }, definition.apiName))) })] }))] }));
}
//# sourceMappingURL=OntologyInheritanceTree.js.map