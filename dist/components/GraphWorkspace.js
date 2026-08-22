import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId } from "react";
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
/** A full-width graph surface with floating controls and an optional inspector. */
export function GraphWorkspace({ toolbar, inspector, children, className, ...props }) {
    return (_jsxs("section", { ...props, className: classes("od-graph-workspace", className), children: [toolbar, _jsx("div", { className: "od-graph-workspace-stage", children: children }), inspector] }));
}
/** Floating graph controls. Each slot accepts host-owned controls and copy. */
export function GraphToolbar({ leading, center, actions, className, ...props }) {
    return (_jsxs("header", { ...props, className: classes("od-graph-toolbar", className), children: [leading ? (_jsx("div", { className: "od-graph-toolbar-leading", children: leading })) : null, center ? _jsx("div", { className: "od-graph-toolbar-center", children: center }) : null, actions ? (_jsx("div", { className: "od-graph-toolbar-actions", children: actions })) : null] }));
}
/** A scrollable viewport and a positioned canvas for nodes and edges. */
export function GraphViewport({ canvasWidth, canvasHeight, canvasClassName, canvasProps, children, className, ...props }) {
    const canvasStyle = {
        ...canvasProps?.style,
        height: canvasHeight,
        width: canvasWidth,
    };
    return (_jsx("div", { ...props, className: classes("od-graph-viewport", className), children: _jsx("div", { ...canvasProps, className: classes("od-graph-canvas", canvasClassName, canvasProps?.className), role: canvasProps?.role ?? "group", style: canvasStyle, children: children }) }));
}
/** An accessible positioned graph node. Arrow-key movement stays host-owned. */
export function GraphNode({ x, y, title, eyebrow, icon, meta, selected = false, dragging = false, dropTarget = false, root = false, tone = "neutral", className, style, type = "button", ...props }) {
    return (_jsxs("button", { ...props, "aria-pressed": props["aria-pressed"] ?? selected, className: classes("od-graph-node", className), "data-root": root, "data-selected": selected, "data-dragging": dragging, "data-drop-target": dropTarget, "data-tone": tone, style: {
            ...style,
            transform: `translate(${String(x)}px, ${String(y)}px)`,
        }, type: type, children: [icon ? _jsx("span", { className: "od-graph-node-icon", children: icon }) : null, _jsxs("span", { className: "od-graph-node-copy", children: [eyebrow ? (_jsx("span", { className: "od-graph-node-eyebrow", children: eyebrow })) : null, _jsx("strong", { className: "od-graph-node-title", children: title }), meta ? _jsx("span", { className: "od-graph-node-meta", children: meta }) : null] })] }));
}
/** The SVG layer below graph nodes. */
export function GraphEdges({ width = "100%", height = "100%", className, children, ...props }) {
    return (_jsx("svg", { ...props, className: classes("od-graph-edges", className), height: height, width: width, children: children }));
}
/** One visual graph connection. Supply onSelect and an aria-label for an interactive edge. */
export function GraphEdge({ path, label, labelX, labelY, selected = false, dashed = false, onSelect, className, onKeyDown, ...props }) {
    function handleKeyDown(event) {
        onKeyDown?.(event);
        if (event.defaultPrevented || !onSelect)
            return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
        }
    }
    const interactiveProps = onSelect
        ? { role: "button", tabIndex: props.tabIndex ?? 0 }
        : { "aria-hidden": true };
    return (_jsxs("g", { ...props, ...interactiveProps, className: classes("od-graph-edge", className), "data-dashed": dashed, "data-selected": selected, onClick: onSelect, onKeyDown: handleKeyDown, children: [_jsx("path", { className: "od-graph-edge-target", d: path }), _jsx("path", { className: "od-graph-edge-line", d: path }), label && labelX !== undefined && labelY !== undefined ? (_jsx("g", { className: "od-graph-edge-label", children: _jsx("text", { x: labelX, y: labelY, children: label }) })) : null] }));
}
/** A responsive inspector which floats on wide screens and docks on small screens. */
export function GraphInspector({ title, eyebrow, icon, actions, onClose, closeLabel = "Close inspector", tone = "neutral", children, className, ...props }) {
    const titleId = useId();
    return (_jsxs("aside", { ...props, "aria-labelledby": props["aria-label"] ? undefined : titleId, className: classes("od-graph-inspector", className), "data-tone": tone, children: [_jsxs("header", { className: "od-graph-inspector-header", children: [icon ? _jsx("span", { className: "od-graph-inspector-icon", children: icon }) : null, _jsxs("div", { className: "od-graph-inspector-heading", children: [eyebrow ? (_jsx("span", { className: "od-graph-inspector-eyebrow", children: eyebrow })) : null, _jsx("h2", { id: titleId, children: title })] }), onClose ? (_jsx("button", { "aria-label": closeLabel, className: "od-graph-inspector-close", onClick: onClose, type: "button", children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) })) : null] }), _jsx("div", { className: "od-graph-inspector-content", children: children }), actions ? (_jsx("footer", { className: "od-graph-inspector-actions", children: actions })) : null] }));
}
//# sourceMappingURL=GraphWorkspace.js.map