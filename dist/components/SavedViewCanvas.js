import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, } from "react";
import { ONTOLOGY_GRAPH_LIMIT, assertBoundedItems, assertFiniteNumber, assertIdentifier, assertTextMaximum, assertUniqueIdentifiers, moveCanvasPosition, validateOntologyRecordSummary, } from "../OntologyExplorerContract.js";
import { GraphEdge, GraphEdges, GraphNode, GraphViewport, GraphWorkspace, } from "./GraphWorkspace.js";
function validateCanvas(props) {
    assertBoundedItems("Saved-view objects", props.objects, ONTOLOGY_GRAPH_LIMIT);
    assertBoundedItems("Saved-view links", props.links, ONTOLOGY_GRAPH_LIMIT);
    assertBoundedItems("Saved-view records", [...props.objects, ...props.links], ONTOLOGY_GRAPH_LIMIT);
    assertBoundedItems("Saved-view positions", props.positions, ONTOLOGY_GRAPH_LIMIT);
    assertUniqueIdentifiers("Saved-view object key", props.objects.map((item) => item.key));
    assertUniqueIdentifiers("Saved-view link key", props.links.map((item) => item.key));
    assertUniqueIdentifiers("Saved-view record key", [...props.objects, ...props.links].map((item) => item.key));
    assertUniqueIdentifiers("Saved-view positioned object key", props.positions.map((item) => item.objectKey));
    assertFiniteNumber("Canvas width", props.canvasWidth);
    assertFiniteNumber("Canvas height", props.canvasHeight);
    if (props.canvasWidth <= 0 || props.canvasHeight <= 0) {
        throw new RangeError("Saved-view canvas dimensions must be positive.");
    }
    const maximumX = Math.max(0, props.canvasWidth - 192);
    const maximumY = Math.max(0, props.canvasHeight - 72);
    const objectKeys = new Set(props.objects.map((item) => item.key));
    for (const object of props.objects) {
        validateOntologyRecordSummary(object, "object");
    }
    for (const link of props.links) {
        validateOntologyRecordSummary(link, "link");
    }
    if (props.positions.length !== props.objects.length) {
        throw new TypeError("Each saved-view object must have one canvas position.");
    }
    for (const position of props.positions) {
        assertTextMaximum("Saved-view positioned object key", position.objectKey, 200);
        assertFiniteNumber("Canvas x", position.x);
        assertFiniteNumber("Canvas y", position.y);
        if (position.x < 0 ||
            position.y < 0 ||
            position.x > maximumX ||
            position.y > maximumY) {
            throw new RangeError("A saved-view position is outside the canvas.");
        }
        if (!objectKeys.has(position.objectKey)) {
            throw new TypeError("A saved-view position names an absent object.");
        }
    }
    for (const link of props.links) {
        assertIdentifier("Saved-view link endpoint", link.endpointA);
        assertIdentifier("Saved-view link endpoint", link.endpointB);
        assertTextMaximum("Saved-view link endpoint", link.endpointA, 200);
        assertTextMaximum("Saved-view link endpoint", link.endpointB, 200);
        if (!objectKeys.has(link.endpointA) || !objectKeys.has(link.endpointB)) {
            throw new TypeError("A saved-view link endpoint is absent from the page.");
        }
        const direction = link.direction;
        if (direction !== "a_to_b" &&
            direction !== "b_to_a" &&
            direction !== "bidirectional") {
            throw new TypeError("A saved-view link direction is invalid.");
        }
    }
}
function edgePath(start, end) {
    const startX = start.x + 96;
    const startY = start.y + 36;
    const endX = end.x + 96;
    const endY = end.y + 36;
    const middleX = (startX + endX) / 2;
    return `M ${String(startX)} ${String(startY)} C ${String(middleX)} ${String(startY)}, ${String(middleX)} ${String(endY)}, ${String(endX)} ${String(endY)}`;
}
/** A controlled graph for current records and saved-view canvas positions. */
export function SavedViewCanvas(props) {
    validateCanvas(props);
    const { canvasHeight, canvasWidth, className, empty, inspector, links, objects, onPositionChange, onSelect, positions, selectedKey, toolbar, ...elementProps } = props;
    const positionByKey = new Map(positions.map((position) => [position.objectKey, position]));
    const pointerDrag = useRef(null);
    const suppressClick = useRef(null);
    function movedPosition(position, deltaX, deltaY) {
        return {
            objectKey: position.objectKey,
            x: Math.min(Math.max(0, canvasWidth - 192), Math.max(0, position.x + deltaX)),
            y: Math.min(Math.max(0, canvasHeight - 72), Math.max(0, position.y + deltaY)),
        };
    }
    function handlePointerDown(event, object) {
        if (!onPositionChange || event.button !== 0)
            return;
        const startPosition = positionByKey.get(object.key);
        if (!startPosition)
            return;
        suppressClick.current = null;
        event.currentTarget.setPointerCapture(event.pointerId);
        pointerDrag.current = {
            pointerId: event.pointerId,
            startClientX: event.clientX,
            startClientY: event.clientY,
            startPosition,
            objectKey: object.key,
            moved: false,
        };
    }
    function handlePointerMove(event) {
        const drag = pointerDrag.current;
        if (drag?.pointerId !== event.pointerId || !onPositionChange)
            return;
        event.preventDefault();
        if (event.clientX !== drag.startClientX ||
            event.clientY !== drag.startClientY) {
            drag.moved = true;
        }
        onPositionChange(movedPosition(drag.startPosition, event.clientX - drag.startClientX, event.clientY - drag.startClientY));
    }
    function releasePointer(event) {
        pointerDrag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    }
    function handlePointerUp(event) {
        const drag = pointerDrag.current;
        if (drag?.pointerId !== event.pointerId)
            return;
        suppressClick.current = drag.moved ? drag.objectKey : null;
        if (drag.moved) {
            globalThis.setTimeout(() => {
                if (suppressClick.current === drag.objectKey) {
                    suppressClick.current = null;
                }
            }, 0);
        }
        releasePointer(event);
    }
    function handlePointerCancel(event) {
        if (pointerDrag.current?.pointerId !== event.pointerId)
            return;
        suppressClick.current = null;
        releasePointer(event);
    }
    function handleNodeKeyDown(event, object) {
        if (!onPositionChange || !event.key.startsWith("Arrow"))
            return;
        if (event.key !== "ArrowLeft" &&
            event.key !== "ArrowRight" &&
            event.key !== "ArrowUp" &&
            event.key !== "ArrowDown") {
            return;
        }
        const position = positionByKey.get(object.key);
        if (!position)
            return;
        event.preventDefault();
        onPositionChange(moveCanvasPosition(position, event.key, {
            maximumX: Math.max(0, canvasWidth - 192),
            maximumY: Math.max(0, canvasHeight - 72),
            step: event.shiftKey ? 36 : 12,
        }));
    }
    return (_jsx(GraphWorkspace, { ...elementProps, className: ["od-saved-view-canvas", className].filter(Boolean).join(" "), inspector: inspector, toolbar: toolbar, children: objects.length === 0 ? (_jsx("output", { className: "od-saved-view-empty", children: empty })) : (_jsxs(GraphViewport, { "aria-label": `Saved view with ${String(objects.length)} objects and ${String(links.length)} links`, canvasHeight: canvasHeight, canvasProps: { "aria-label": "Current saved-view graph" }, canvasWidth: canvasWidth, children: [_jsx(GraphEdges, { "aria-label": "Current links", role: "group", children: links.map((link) => {
                        const start = positionByKey.get(link.endpointA);
                        const end = positionByKey.get(link.endpointB);
                        if (!start || !end)
                            return null;
                        const directionLabel = link.direction === "a_to_b"
                            ? "A → B"
                            : link.direction === "b_to_a"
                                ? "B → A"
                                : "A ↔ B";
                        return (_jsx(GraphEdge, { "aria-label": `Open ${link.displayTitle}`, onSelect: onSelect
                                ? () => {
                                    onSelect(link);
                                }
                                : undefined, label: directionLabel, labelX: (start.x + end.x) / 2 + 96, labelY: (start.y + end.y) / 2 + 24, path: edgePath(start, end), selected: selectedKey === link.key }, link.key));
                    }) }), objects.map((object) => {
                    const position = positionByKey.get(object.key);
                    if (!position)
                        return null;
                    return (_jsx(GraphNode, { "aria-label": onPositionChange
                            ? `${object.displayTitle}. Drag it or use arrow keys to move it.`
                            : onSelect
                                ? `Open ${object.displayTitle}`
                                : object.displayTitle, disabled: !onSelect && !onPositionChange, eyebrow: object.type, meta: object.key, onClick: onSelect
                            ? () => {
                                if (suppressClick.current === object.key) {
                                    suppressClick.current = null;
                                    return;
                                }
                                onSelect(object);
                            }
                            : undefined, onKeyDown: (event) => {
                            handleNodeKeyDown(event, object);
                        }, onPointerCancel: handlePointerCancel, onPointerDown: (event) => {
                            handlePointerDown(event, object);
                        }, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, selected: selectedKey === object.key, title: object.displayTitle, tone: "lime", x: position.x, y: position.y }, object.key));
                })] })) }));
}
//# sourceMappingURL=SavedViewCanvas.js.map