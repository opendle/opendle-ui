import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, Fragment, isValidElement, useId, useLayoutEffect, useRef, useState, } from "react";
import { clampGraphPosition, clampGraphViewport, moveGraphPosition, zoomGraphViewportAtPoint, } from "../GraphLayout.js";
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
function hasRenderedContent(value) {
    let found = false;
    Children.forEach(value, (child) => {
        if (found ||
            child === null ||
            child === undefined ||
            typeof child === "boolean") {
            return;
        }
        if (typeof child === "string" && child.length === 0)
            return;
        if (isValidElement(child) &&
            child.type === Fragment) {
            found = hasRenderedContent(child.props.children);
            return;
        }
        found = true;
    });
    return found;
}
/** A full-width graph surface with floating controls and an optional inspector. */
export function GraphWorkspace({ toolbar, inspector, selectedControlRef, fullPage = false, children, className, ...props }) {
    const hostRef = useRef(null);
    useInspectorReachability(hostRef, selectedControlRef, inspector !== undefined && inspector !== null);
    return (_jsxs("section", { ...props, className: classes("od-graph-workspace", className), "data-full-page": fullPage, ref: hostRef, children: [toolbar, _jsx("div", { className: "od-graph-workspace-stage", children: children }), inspector] }));
}
export function useInspectorReachability(hostRef, selectedControlRef, active) {
    useLayoutEffect(() => {
        const host = hostRef.current;
        if (!host || !active)
            return;
        const keepReachable = () => {
            if (host.dataset.inspectorMode !== "overlay")
                return;
            const control = selectedControlRef?.current;
            if (!control?.isConnected)
                return;
            const viewport = control.closest(".od-graph-viewport, .od-relationship-graph-viewport");
            const inspector = host.querySelector(".od-graph-inspector[data-mode='overlay']");
            if (!viewport || !inspector)
                return;
            const controlBounds = control.getBoundingClientRect();
            const viewportBounds = viewport.getBoundingClientRect();
            const inspectorBounds = inspector.getBoundingClientRect();
            const visibleEnd = Math.min(viewportBounds.right, inspectorBounds.left);
            if (controlBounds.right > visibleEnd) {
                viewport.scrollLeft += controlBounds.right - visibleEnd;
            }
            else if (controlBounds.left < viewportBounds.left) {
                viewport.scrollLeft -= viewportBounds.left - controlBounds.left;
            }
        };
        const mutationObserver = new MutationObserver(keepReachable);
        mutationObserver.observe(host, {
            attributeFilter: ["data-inspector-mode"],
            attributes: true,
        });
        const geometryObserver = typeof globalThis.ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(keepReachable);
        const inspector = host.querySelector(".od-graph-inspector");
        if (inspector)
            geometryObserver?.observe(inspector);
        keepReachable();
        return () => {
            geometryObserver?.disconnect();
            mutationObserver.disconnect();
        };
    });
}
/** Floating graph controls. Each slot accepts host-owned controls and copy. */
export function GraphToolbar({ leading, center, actions, className, ...props }) {
    const hasLeading = hasRenderedContent(leading);
    const hasCenter = hasRenderedContent(center);
    const hasActions = hasRenderedContent(actions);
    return (_jsxs("header", { ...props, className: classes("od-graph-toolbar", className), "data-actions": hasActions, "data-center": hasCenter, "data-leading": hasLeading, children: [hasLeading ? (_jsx("div", { className: "od-graph-toolbar-leading", children: leading })) : null, hasCenter ? (_jsx("div", { className: "od-graph-toolbar-center", children: center })) : null, hasActions ? (_jsx("div", { className: "od-graph-toolbar-actions", children: actions })) : null] }));
}
/** Shared, labelled controls for controlled graph view and layout actions. */
export function GraphViewportControls({ onZoomIn, onZoomOut, onFitView, onAutomaticLayout, zoomInLabel = "Zoom in", zoomOutLabel = "Zoom out", fitViewLabel = "Fit view", automaticLayoutLabel = "Automatic layout", zoomInDisabled = false, zoomOutDisabled = false, fitViewDisabled = false, automaticLayoutDisabled = false, className, ...props }) {
    return (_jsxs("div", { ...props, "aria-label": props["aria-label"] ?? "Graph view controls", className: classes("od-graph-viewport-controls", className), role: props.role ?? "group", children: [onZoomOut ? (_jsx("button", { "aria-label": zoomOutLabel, disabled: zoomOutDisabled, onClick: onZoomOut, type: "button", children: "\u2212" })) : null, onZoomIn ? (_jsx("button", { "aria-label": zoomInLabel, disabled: zoomInDisabled, onClick: onZoomIn, type: "button", children: "+" })) : null, onFitView ? (_jsx("button", { disabled: fitViewDisabled, onClick: onFitView, type: "button", children: fitViewLabel })) : null, onAutomaticLayout ? (_jsx("button", { disabled: automaticLayoutDisabled, onClick: onAutomaticLayout, type: "button", children: automaticLayoutLabel })) : null] }));
}
function usePreventGraphWheelDefault(viewportRef, enabled) {
    useLayoutEffect(() => {
        const element = viewportRef.current;
        if (!element || !enabled)
            return;
        const preventNativeWheel = (event) => {
            if (event.target instanceof Node &&
                element.contains(event.target) &&
                (event.deltaX !== 0 || event.deltaY !== 0)) {
                event.preventDefault();
            }
        };
        // A non-passive listener is required because React wheel listeners cannot cancel page zoom.
        // react-doctor-disable-next-line client-passive-event-listeners, react-doctor/client-passive-event-listeners
        element.ownerDocument.addEventListener("wheel", preventNativeWheel, {
            passive: false,
        });
        return () => {
            element.ownerDocument.removeEventListener("wheel", preventNativeWheel);
        };
    }, [enabled, viewportRef]);
}
/** A scrollable or controlled pan-and-zoom viewport for graph content. */
export function GraphViewport({ canvasAlignment = "start", canvasWidth, canvasHeight, canvasClassName, canvasProps, viewport, viewportLimits, onViewportChange, panStep = 24, zoomStep = 0.1, connectionMode = false, onConnectionCancel, children, className, onClick, onKeyDown, onLostPointerCapture, onPointerCancel, onPointerDown, onPointerMove, onPointerUp, onWheel, role: suppliedRole, ...props }) {
    const viewportRef = useRef(null);
    const pointerPanRef = useRef(null);
    const pointerMovedRef = useRef(false);
    if (!Number.isFinite(panStep) || panStep <= 0) {
        throw new Error("Graph viewport pan step must be finite and positive.");
    }
    if (!Number.isFinite(zoomStep) || zoomStep <= 0) {
        throw new Error("Graph viewport zoom step must be finite and positive.");
    }
    const controlledViewport = viewport
        ? clampGraphViewport(viewport, viewportLimits)
        : undefined;
    const panZoomEnabled = controlledViewport !== undefined;
    usePreventGraphWheelDefault(viewportRef, panZoomEnabled);
    useLayoutEffect(() => {
        if (pointerPanRef.current && controlledViewport) {
            pointerPanRef.current.viewport = controlledViewport;
        }
    }, [controlledViewport]);
    const canvasStyle = {
        ...canvasProps?.style,
        height: canvasHeight,
        transform: controlledViewport
            ? `translate(${String(controlledViewport.x)}px, ${String(controlledViewport.y)}px) scale(${String(controlledViewport.zoom)})`
            : canvasProps?.style?.transform,
        transformOrigin: controlledViewport
            ? "0 0"
            : canvasProps?.style?.transformOrigin,
        width: canvasWidth,
    };
    function reportViewportChange(next, reason) {
        const safeNext = clampGraphViewport(next, viewportLimits);
        if (safeNext.x !== controlledViewport?.x ||
            safeNext.y !== controlledViewport.y ||
            safeNext.zoom !== controlledViewport.zoom) {
            onViewportChange?.(safeNext, reason);
        }
        return safeNext;
    }
    function zoomAtCenter(element, zoom) {
        if (!controlledViewport)
            return;
        reportViewportChange(zoomGraphViewportAtPoint(controlledViewport, zoom, { x: element.clientWidth / 2, y: element.clientHeight / 2 }, viewportLimits), "keyboard");
    }
    function handleKeyDown(event) {
        onKeyDown?.(event);
        if (event.defaultPrevented)
            return;
        if (event.key === "Escape" && connectionMode && onConnectionCancel) {
            event.preventDefault();
            onConnectionCancel();
            return;
        }
        if (!controlledViewport)
            return;
        const movementByKey = {
            ArrowDown: { x: 0, y: panStep },
            ArrowLeft: { x: -panStep, y: 0 },
            ArrowRight: { x: panStep, y: 0 },
            ArrowUp: { x: 0, y: -panStep },
        };
        const movement = movementByKey[event.key];
        if (movement) {
            event.preventDefault();
            reportViewportChange({
                ...controlledViewport,
                x: controlledViewport.x + movement.x,
                y: controlledViewport.y + movement.y,
            }, "keyboard");
            return;
        }
        if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            zoomAtCenter(event.currentTarget, controlledViewport.zoom + zoomStep);
        }
        else if (event.key === "-" || event.key === "_") {
            event.preventDefault();
            zoomAtCenter(event.currentTarget, controlledViewport.zoom - zoomStep);
        }
    }
    function isGraphBackground(target) {
        return (target instanceof Element &&
            (target.classList.contains("od-graph-viewport") ||
                target.classList.contains("od-graph-canvas")));
    }
    function runViewportBackgroundAction(event) {
        if (pointerMovedRef.current) {
            pointerMovedRef.current = false;
            event.preventDefault();
            return;
        }
        onClick?.(event);
        if (!event.defaultPrevented &&
            connectionMode &&
            onConnectionCancel &&
            isGraphBackground(event.target)) {
            onConnectionCancel();
        }
    }
    function handlePointerDown(event) {
        onPointerDown?.(event);
        if (event.defaultPrevented ||
            event.button !== 0 ||
            !controlledViewport ||
            !isGraphBackground(event.target)) {
            return;
        }
        pointerPanRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            viewport: controlledViewport,
        };
        pointerMovedRef.current = false;
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function handlePointerMove(event) {
        onPointerMove?.(event);
        const pointerPan = pointerPanRef.current;
        if (event.defaultPrevented || pointerPan?.pointerId !== event.pointerId) {
            return;
        }
        if (event.clientX !== pointerPan.clientX ||
            event.clientY !== pointerPan.clientY) {
            pointerMovedRef.current = true;
        }
        event.preventDefault();
        const safeNext = reportViewportChange({
            ...pointerPan.viewport,
            x: pointerPan.viewport.x + event.clientX - pointerPan.clientX,
            y: pointerPan.viewport.y + event.clientY - pointerPan.clientY,
        }, "pointer");
        pointerPan.clientX = event.clientX;
        pointerPan.clientY = event.clientY;
        pointerPan.viewport = safeNext;
    }
    function finishPointerPan(event) {
        const pointerPan = pointerPanRef.current;
        if (pointerPan?.pointerId === event.pointerId) {
            pointerPanRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
        }
    }
    function handlePointerUp(event) {
        onPointerUp?.(event);
        finishPointerPan(event);
    }
    function handlePointerCancel(event) {
        onPointerCancel?.(event);
        finishPointerPan(event);
        pointerMovedRef.current = false;
    }
    function handleLostPointerCapture(event) {
        onLostPointerCapture?.(event);
        if (pointerPanRef.current?.pointerId === event.pointerId) {
            pointerPanRef.current = null;
        }
    }
    function changeViewportFromWheel(event) {
        onWheel?.(event);
        if (event.defaultPrevented || !controlledViewport)
            return;
        if (event.ctrlKey || event.metaKey) {
            if (event.deltaY === 0)
                return;
            const bounds = event.currentTarget.getBoundingClientRect();
            const direction = event.deltaY > 0 ? -1 : 1;
            reportViewportChange(zoomGraphViewportAtPoint(controlledViewport, controlledViewport.zoom + direction * zoomStep, { x: event.clientX - bounds.left, y: event.clientY - bounds.top }, viewportLimits), "wheel");
            return;
        }
        if (event.deltaX === 0 && event.deltaY === 0)
            return;
        reportViewportChange({
            ...controlledViewport,
            x: controlledViewport.x - event.deltaX,
            y: controlledViewport.y - event.deltaY,
        }, "wheel");
    }
    const viewportSemanticProps = {
        role: suppliedRole ?? (controlledViewport ? "application" : "region"),
    };
    return (_jsx("div", { "aria-label": "Graph viewport", role: "application", ...props, ...viewportSemanticProps, className: classes("od-graph-viewport", className), "data-canvas-alignment": canvasAlignment, "data-connection-mode": connectionMode, "data-pan-zoom": controlledViewport !== undefined, onClick: runViewportBackgroundAction, onKeyDown: handleKeyDown, onLostPointerCapture: handleLostPointerCapture, onPointerCancel: handlePointerCancel, onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onWheel: changeViewportFromWheel, ref: viewportRef, tabIndex: controlledViewport ? (props.tabIndex ?? 0) : props.tabIndex, children: _jsx("div", { ...canvasProps, className: classes("od-graph-canvas", canvasClassName, canvasProps?.className), "data-alignment": canvasAlignment, role: canvasProps?.role ?? "group", style: canvasStyle, children: children }) }));
}
/** An accessible empty state for a graph canvas. */
export function GraphEmptyState({ actions, className, description, headingLevel = "h2", icon, role = "status", title, ...props }) {
    const titleId = useId();
    const Heading = headingLevel;
    return (_jsxs("div", { ...props, "aria-labelledby": props["aria-labelledby"] ?? titleId, className: classes("od-graph-empty-state", className), role: role, children: [_jsx("span", { "aria-hidden": "true", className: "od-graph-empty-state-icon", children: icon }), _jsxs("div", { className: "od-graph-empty-state-copy", children: [_jsx(Heading, { id: titleId, children: title }), _jsx("div", { className: "od-graph-empty-state-description", children: description })] }), actions ? (_jsx("div", { className: "od-graph-empty-state-actions", children: actions })) : null] }));
}
/** An accessible, controlled graph node with pointer and keyboard movement. */
export function GraphNode({ x, y, title, eyebrow, icon, meta, selected = false, dragging = false, dropTarget = false, root = false, tone = "neutral", onPositionChange, positionBounds, keyboardMoveStep = 16, viewportZoom = 1, connectionTarget = false, onConnectionTarget, className, style, type = "button", onClick, onKeyDown, onLostPointerCapture, onPointerCancel, onPointerDown, onPointerMove, onPointerUp, ...props }) {
    const pointerMoveRef = useRef(null);
    const pointerMovedRef = useRef(false);
    if (!Number.isFinite(keyboardMoveStep) || keyboardMoveStep <= 0) {
        throw new Error("Graph node keyboard movement step must be finite and positive.");
    }
    if (!Number.isFinite(viewportZoom) || viewportZoom <= 0) {
        throw new Error("Graph node viewport zoom must be finite and positive.");
    }
    useLayoutEffect(() => {
        if (pointerMoveRef.current) {
            pointerMoveRef.current.position = { x, y };
        }
    }, [x, y]);
    function reportPosition(position, reason) {
        const safePosition = positionBounds
            ? clampGraphPosition(position, positionBounds)
            : position;
        if (safePosition.x !== x || safePosition.y !== y) {
            onPositionChange?.(safePosition, reason);
        }
        return safePosition;
    }
    function runNodeAction(event) {
        if (pointerMovedRef.current) {
            pointerMovedRef.current = false;
            event.preventDefault();
            return;
        }
        if (connectionTarget && onConnectionTarget) {
            event.preventDefault();
            onConnectionTarget();
            return;
        }
        onClick?.(event);
    }
    function handleKeyDown(event) {
        onKeyDown?.(event);
        if (event.defaultPrevented || !onPositionChange)
            return;
        const screenStep = keyboardMoveStep / viewportZoom;
        const movementByKey = {
            ArrowDown: { x: 0, y: screenStep },
            ArrowLeft: { x: -screenStep, y: 0 },
            ArrowRight: { x: screenStep, y: 0 },
            ArrowUp: { x: 0, y: -screenStep },
        };
        const movement = movementByKey[event.key];
        if (!movement)
            return;
        event.preventDefault();
        reportPosition(moveGraphPosition({ x, y }, movement, positionBounds), "keyboard");
    }
    function handlePointerDown(event) {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.button !== 0 || !onPositionChange) {
            return;
        }
        pointerMovedRef.current = false;
        pointerMoveRef.current = {
            pointerId: event.pointerId,
            clientX: event.clientX,
            clientY: event.clientY,
            position: { x, y },
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    }
    function handlePointerMove(event) {
        onPointerMove?.(event);
        const pointerMove = pointerMoveRef.current;
        if (event.defaultPrevented || pointerMove?.pointerId !== event.pointerId) {
            return;
        }
        const delta = {
            x: (event.clientX - pointerMove.clientX) / viewportZoom,
            y: (event.clientY - pointerMove.clientY) / viewportZoom,
        };
        if (delta.x !== 0 || delta.y !== 0)
            pointerMovedRef.current = true;
        event.preventDefault();
        const safePosition = reportPosition(moveGraphPosition(pointerMove.position, delta, positionBounds), "pointer");
        pointerMove.clientX = event.clientX;
        pointerMove.clientY = event.clientY;
        pointerMove.position = safePosition;
    }
    function finishPointerMove(event) {
        const pointerMove = pointerMoveRef.current;
        if (pointerMove?.pointerId === event.pointerId) {
            pointerMoveRef.current = null;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
        }
    }
    function handlePointerUp(event) {
        onPointerUp?.(event);
        finishPointerMove(event);
    }
    function handlePointerCancel(event) {
        onPointerCancel?.(event);
        finishPointerMove(event);
        pointerMovedRef.current = false;
    }
    function handleLostPointerCapture(event) {
        onLostPointerCapture?.(event);
        if (pointerMoveRef.current?.pointerId === event.pointerId) {
            pointerMoveRef.current = null;
        }
    }
    return (_jsxs("button", { ...props, "aria-pressed": props["aria-pressed"] ?? selected, className: classes("od-graph-node", className), "data-connection-target": connectionTarget, "data-root": root, "data-selected": selected, "data-dragging": dragging, "data-drop-target": dropTarget, "data-tone": tone, onClick: runNodeAction, onKeyDown: handleKeyDown, onLostPointerCapture: handleLostPointerCapture, onPointerCancel: handlePointerCancel, onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, style: {
            ...style,
            transform: `translate(${String(x)}px, ${String(y)}px)`,
        }, type: type, children: [icon ? _jsx("span", { className: "od-graph-node-icon", children: icon }) : null, _jsxs("span", { className: "od-graph-node-copy", children: [eyebrow ? (_jsx("span", { className: "od-graph-node-eyebrow", children: eyebrow })) : null, _jsx("strong", { className: "od-graph-node-title", children: title }), meta ? _jsx("span", { className: "od-graph-node-meta", children: meta }) : null] })] }));
}
/** A separately focusable graph action that a host can place by one node. */
export function GraphNodeAction({ x, y, viewportZoom = 1, className, style, type = "button", ...props }) {
    if (!Number.isFinite(viewportZoom) || viewportZoom <= 0) {
        throw new Error("Graph node action viewport zoom must be finite and positive.");
    }
    return (_jsx("button", { ...props, className: classes("od-graph-node-action", className), style: {
            ...style,
            transform: `translate(${String(x)}px, ${String(y)}px) scale(${String(1 / viewportZoom)})`,
            transformOrigin: "0 0",
        }, type: type }));
}
/** The SVG layer below graph nodes. */
export function GraphEdges({ width = "100%", height = "100%", className, children, ...props }) {
    return (_jsx("svg", { ...props, className: classes("od-graph-edges", className), height: height, width: width, children: children }));
}
/** One visual graph connection. Supply onSelect and an aria-label for an interactive edge. */
export function GraphEdge({ path, label, labelX, labelY, selected = false, dashed = false, directed = false, onSelect, className, onKeyDown, ...props }) {
    const markerId = useId().replaceAll(":", "");
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
    return (_jsxs("g", { ...props, ...interactiveProps, className: classes("od-graph-edge", className), "data-dashed": dashed, "data-directed": directed, "data-selected": selected, onClick: onSelect, onKeyDown: handleKeyDown, children: [directed ? (_jsx("defs", { children: _jsx("marker", { id: markerId, markerHeight: "8", markerUnits: "strokeWidth", markerWidth: "8", orient: "auto", refX: "7", refY: "4", viewBox: "0 0 8 8", children: _jsx("path", { className: "od-graph-edge-arrow", d: "M 0 0 L 8 4 L 0 8 z" }) }) })) : null, _jsx("path", { className: "od-graph-edge-target", d: path }), _jsx("path", { className: "od-graph-edge-line", d: path, markerEnd: directed ? `url(#${markerId})` : undefined }), label && labelX !== undefined && labelY !== undefined ? (_jsx("g", { className: "od-graph-edge-label", children: _jsx("text", { x: labelX, y: labelY, children: label }) })) : null] }));
}
/** One selectable link junction with labelled endpoint A and B branches. */
export function GraphBundledLink({ pathA, pathB, junctionX, junctionY, label, endpointALabel = "A", endpointBLabel = "B", selected = false, onSelect, className, onKeyDown, ...props }) {
    function handleKeyDown(event) {
        onKeyDown?.(event);
        if (event.defaultPrevented)
            return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
        }
    }
    return (_jsxs("g", { ...props, "aria-pressed": props["aria-pressed"] ?? selected, className: classes("od-graph-bundled-link", className), "data-selected": selected, onClick: onSelect, onKeyDown: handleKeyDown, role: "button", tabIndex: props.tabIndex ?? 0, children: [_jsx("path", { className: "od-graph-bundled-link-target", d: pathA }), _jsx("path", { className: "od-graph-bundled-link-target", d: pathB }), _jsx("path", { className: "od-graph-bundled-link-branch", d: pathA, "data-endpoint": "A" }), _jsx("path", { className: "od-graph-bundled-link-branch", d: pathB, "data-endpoint": "B" }), _jsxs("g", { className: "od-graph-bundled-link-junction", transform: `translate(${String(junctionX)} ${String(junctionY)})`, children: [_jsx("rect", { height: "40", rx: "8", width: "112", x: "-56", y: "-20" }), _jsx("text", { className: "od-graph-bundled-link-endpoint", x: "-45", y: "4", children: endpointALabel }), _jsx("text", { className: "od-graph-bundled-link-label", x: "0", y: "4", children: label }), _jsx("text", { className: "od-graph-bundled-link-endpoint", x: "45", y: "4", children: endpointBLabel })] })] }));
}
function restoreInspectorFocus(target) {
    if (!target?.isConnected)
        return;
    const apply = () => {
        const active = document.activeElement;
        if (active instanceof HTMLElement &&
            active !== document.body &&
            active !== document.documentElement)
            return;
        if (target.isConnected)
            target.focus({ preventScroll: true });
    };
    if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(() => requestAnimationFrame(apply));
    else
        apply();
}
function findInspectorFocusFallback(inspector) {
    const host = inspector.parentElement?.closest(".od-graph-workspace, .od-relationship-graph");
    if (!host)
        return null;
    const selectors = [
        ":is(.od-graph-viewport, .od-relationship-graph-viewport) [data-selected='true']:not(:disabled)",
        ":is(.od-graph-viewport, .od-relationship-graph-viewport) [tabindex='0']:not(:disabled)",
        ":is(.od-graph-viewport, .od-relationship-graph-viewport) :is(button:not(:disabled), a[href], [tabindex]:not([tabindex='-1']))",
    ];
    for (const selector of selectors) {
        const target = host.querySelector(selector);
        if (target?.isConnected)
            return target;
    }
    return null;
}
function isModalDialog(inspector) {
    try {
        return inspector.matches(":modal");
    }
    catch {
        return false;
    }
}
function focusInspector(inspector, heading, initialFocusRef) {
    const suppliedInitialFocus = initialFocusRef?.current;
    const initialFocus = heading ??
        (suppliedInitialFocus && inspector.contains(suppliedInitialFocus)
            ? suppliedInitialFocus
            : null) ??
        inspector.querySelector("[data-graph-inspector-close]") ??
        inspector.querySelector("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])") ??
        inspector;
    initialFocus.focus({ preventScroll: true });
}
function useGraphInspectorMode(inspectorRef, headingRef) {
    const [mode, setMode] = useState("overlay");
    const [hosted, setHosted] = useState(false);
    const modeRef = useRef("overlay");
    const modeTransitionRef = useRef(null);
    const lastInspectorFocusRef = useRef(null);
    useLayoutEffect(() => {
        const handleFocusIn = (event) => {
            const inspector = inspectorRef.current;
            const target = event.target;
            if (!inspector || !(target instanceof HTMLElement))
                return;
            lastInspectorFocusRef.current = inspector.contains(target)
                ? target
                : null;
        };
        document.addEventListener("focusin", handleFocusIn);
        return () => {
            document.removeEventListener("focusin", handleFocusIn);
        };
    }, [inspectorRef]);
    useLayoutEffect(() => {
        const inspector = inspectorRef.current;
        const host = inspector?.parentElement?.closest(".od-graph-workspace, .od-relationship-graph");
        if (!inspector || !host)
            return;
        setHosted(true);
        const remProbe = document.createElement("span");
        remProbe.ariaHidden = "true";
        remProbe.className = "od-graph-inspector-rem-probe";
        host.append(remProbe);
        const updateMode = () => {
            const width = host.clientWidth;
            const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
            const nextMode = width >= 69 * rootFontSize
                ? "split"
                : width > 48 * rootFontSize
                    ? "overlay"
                    : "sheet";
            host.dataset.inspectorMode = nextMode;
            if (nextMode === modeRef.current)
                return;
            const content = inspector.querySelector(".od-graph-inspector-content");
            const active = document.activeElement;
            const activeIsInside = active instanceof HTMLElement && inspector.contains(active);
            const lastInspectorFocus = lastInspectorFocusRef.current;
            const focusWasInside = activeIsInside ||
                (active === document.body &&
                    lastInspectorFocus !== null &&
                    !lastInspectorFocus.isConnected);
            modeTransitionRef.current = {
                focus: activeIsInside ? active : lastInspectorFocus,
                focusWasInside,
                scrollTop: content?.scrollTop ?? 0,
            };
            modeRef.current = nextMode;
            setMode(nextMode);
        };
        const observer = typeof globalThis.ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(updateMode);
        observer?.observe(host);
        observer?.observe(remProbe);
        updateMode();
        return () => {
            observer?.disconnect();
            remProbe.remove();
            delete host.dataset.inspectorMode;
        };
    }, [inspectorRef]);
    useLayoutEffect(() => {
        const inspector = inspectorRef.current;
        if (!inspector)
            return;
        const content = inspector.querySelector(".od-graph-inspector-content");
        const transition = modeTransitionRef.current;
        modeTransitionRef.current = null;
        const contentScrollTop = transition?.scrollTop ?? content?.scrollTop ?? 0;
        const previousFocus = transition?.focus ??
            (inspector.contains(document.activeElement)
                ? document.activeElement
                : null);
        const isModal = isModalDialog(inspector);
        if (mode === "sheet" &&
            !isModal &&
            typeof inspector.showModal === "function") {
            if (inspector.open)
                inspector.close();
            inspector.showModal();
        }
        else if (mode !== "sheet" && isModal) {
            inspector.close();
            if (typeof inspector.show === "function")
                inspector.show();
        }
        else if (!inspector.open && typeof inspector.show === "function") {
            inspector.show();
        }
        if (content)
            content.scrollTop = contentScrollTop;
        if (transition?.focusWasInside &&
            (!previousFocus?.isConnected || !inspector.contains(previousFocus))) {
            headingRef.current?.focus({ preventScroll: true });
        }
        else if (transition !== null && !transition.focusWasInside) {
            if (mode === "sheet")
                headingRef.current?.focus({ preventScroll: true });
        }
        else if (previousFocus?.isConnected) {
            previousFocus.focus({ preventScroll: true });
        }
        else if (mode === "sheet" &&
            !inspector.contains(document.activeElement)) {
            headingRef.current?.focus({ preventScroll: true });
        }
    }, [headingRef, inspectorRef, mode]);
    return { hosted, mode };
}
/** A responsive inspector with initial focus, Escape close, and exact focus return. */
export function GraphInspector({ activationKey, title, eyebrow, icon, actions, onClose, onCancel, closeLabel = "Close inspector", initialFocusRef, returnFocusRef: suppliedReturnFocusRef, tone = "neutral", children, className, tabIndex, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }) {
    const titleId = useId();
    const inspectorRef = useRef(null);
    const headingRef = useRef(null);
    const { hosted, mode } = useGraphInspectorMode(inspectorRef, headingRef);
    const capturedReturnFocusRef = useRef(null);
    const closeReturnFocusRef = useRef(null);
    const latestSuppliedReturnFocusRef = useRef(null);
    useLayoutEffect(() => {
        const target = suppliedReturnFocusRef?.current;
        if (!target?.isConnected)
            return;
        const previousTarget = latestSuppliedReturnFocusRef.current;
        latestSuppliedReturnFocusRef.current = target;
        const inspector = inspectorRef.current;
        if (previousTarget === null ||
            previousTarget === target ||
            !inspector ||
            inspector.contains(document.activeElement))
            return;
        capturedReturnFocusRef.current = target;
        focusInspector(inspector, headingRef.current, initialFocusRef);
    });
    useLayoutEffect(() => {
        const inspector = inspectorRef.current;
        if (!inspector)
            return;
        closeReturnFocusRef.current = null;
        const suppliedReturnFocus = suppliedReturnFocusRef?.current;
        if (suppliedReturnFocus?.isConnected) {
            capturedReturnFocusRef.current = suppliedReturnFocus;
        }
        else {
            const active = document.activeElement;
            if (active instanceof HTMLElement && !inspector.contains(active)) {
                capturedReturnFocusRef.current = active;
            }
        }
        focusInspector(inspector, headingRef.current, initialFocusRef);
        return () => {
            const returnTarget = closeReturnFocusRef.current ??
                latestSuppliedReturnFocusRef.current ??
                capturedReturnFocusRef.current;
            const element = inspector;
            const apply = () => {
                if (!element.isConnected)
                    restoreInspectorFocus(returnTarget);
            };
            if (typeof requestAnimationFrame === "function")
                requestAnimationFrame(apply);
            else
                apply();
        };
    }, [activationKey, initialFocusRef, suppliedReturnFocusRef]);
    function closeInspector() {
        const requestedReturnTarget = suppliedReturnFocusRef?.current ?? capturedReturnFocusRef.current;
        const returnTarget = requestedReturnTarget?.isConnected
            ? requestedReturnTarget
            : inspectorRef.current
                ? findInspectorFocusFallback(inspectorRef.current)
                : null;
        closeReturnFocusRef.current = returnTarget;
        const inspector = inspectorRef.current;
        if (inspector && isModalDialog(inspector))
            inspector.close();
        onClose?.();
        if (returnTarget?.isConnected)
            returnTarget.focus({ preventScroll: true });
        restoreInspectorFocus(returnTarget);
    }
    const handleInspectorKeyboardRef = useRef(() => undefined);
    useLayoutEffect(() => {
        handleInspectorKeyboardRef.current = (event) => {
            const inspector = inspectorRef.current;
            if (!inspector ||
                event.defaultPrevented ||
                !(event.target instanceof Node) ||
                !inspector.contains(event.target))
                return;
            if (event.key === "Tab" && isModalDialog(inspector)) {
                const focusTargets = [
                    ...inspector.querySelectorAll("button:not(:disabled), input:not(:disabled):not([type='hidden']), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])"),
                ].filter((element) => element !== inspector &&
                    element.getAttribute("aria-hidden") !== "true" &&
                    element.getClientRects().length > 0);
                const first = focusTargets.at(0) ?? headingRef.current;
                const last = focusTargets.at(-1) ?? headingRef.current;
                const active = document.activeElement;
                const target = event.shiftKey
                    ? active === headingRef.current ||
                        active === first ||
                        !inspector.contains(active)
                        ? last
                        : null
                    : active === last || !inspector.contains(active)
                        ? first
                        : null;
                if (!target)
                    return;
                event.preventDefault();
                target.focus({ preventScroll: true });
                return;
            }
            if (event.key !== "Escape" ||
                onClose === undefined ||
                isModalDialog(inspector))
                return;
            event.preventDefault();
            event.stopPropagation();
            closeInspector();
        };
    });
    useLayoutEffect(() => {
        const handleKeyDown = (event) => {
            handleInspectorKeyboardRef.current(event);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    return (_jsxs("dialog", { ...props, "aria-label": ariaLabel, "aria-labelledby": ariaLabel === undefined ? (ariaLabelledBy ?? titleId) : undefined, className: classes("od-graph-inspector", className), "data-hosted": hosted, "data-mode": mode, "data-tone": tone, open: true, onCancel: (event) => {
            onCancel?.(event);
            if (event.defaultPrevented || onClose === undefined)
                return;
            event.preventDefault();
            closeInspector();
        }, ref: inspectorRef, tabIndex: tabIndex ?? -1, children: [_jsxs("header", { className: "od-graph-inspector-header", children: [icon ? _jsx("span", { className: "od-graph-inspector-icon", children: icon }) : null, _jsxs("div", { className: "od-graph-inspector-heading", children: [eyebrow ? (_jsx("span", { className: "od-graph-inspector-eyebrow", children: eyebrow })) : null, _jsx("h2", { id: titleId, ref: headingRef, tabIndex: -1, children: title })] }), onClose ? (_jsx("button", { "aria-label": closeLabel, className: "od-graph-inspector-close", "data-graph-inspector-close": "true", onClick: closeInspector, type: "button", children: _jsx("span", { "aria-hidden": "true", children: "\u00D7" }) })) : null] }), _jsx("div", { className: "od-graph-inspector-content", children: children }), actions ? (_jsx("footer", { className: "od-graph-inspector-actions", children: actions })) : null] }));
}
//# sourceMappingURL=GraphWorkspace.js.map