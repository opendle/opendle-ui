import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children, Fragment, isValidElement, useId, useLayoutEffect, useRef, useState, } from "react";
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
export function GraphWorkspace({ toolbar, inspector, selectedControlRef, children, className, ...props }) {
    const hostRef = useRef(null);
    useInspectorReachability(hostRef, selectedControlRef, inspector !== undefined && inspector !== null);
    return (_jsxs("section", { ...props, className: classes("od-graph-workspace", className), ref: hostRef, children: [toolbar, _jsx("div", { className: "od-graph-workspace-stage", children: children }), inspector] }));
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
        const geometryObserver = new ResizeObserver(keepReachable);
        const inspector = host.querySelector(".od-graph-inspector");
        if (inspector)
            geometryObserver.observe(inspector);
        keepReachable();
        return () => {
            geometryObserver.disconnect();
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
/** A scrollable viewport and a positioned canvas for nodes and edges. */
export function GraphViewport({ canvasAlignment = "start", canvasWidth, canvasHeight, canvasClassName, canvasProps, children, className, ...props }) {
    const canvasStyle = {
        ...canvasProps?.style,
        height: canvasHeight,
        width: canvasWidth,
    };
    return (_jsx("div", { ...props, className: classes("od-graph-viewport", className), "data-canvas-alignment": canvasAlignment, role: props.role ?? "region", children: _jsx("div", { ...canvasProps, className: classes("od-graph-canvas", canvasClassName, canvasProps?.className), "data-alignment": canvasAlignment, role: canvasProps?.role ?? "group", style: canvasStyle, children: children }) }));
}
/** An accessible empty state for a graph canvas. */
export function GraphEmptyState({ actions, className, description, headingLevel = "h2", icon, role = "status", title, ...props }) {
    const titleId = useId();
    const Heading = headingLevel;
    return (_jsxs("div", { ...props, "aria-labelledby": props["aria-labelledby"] ?? titleId, className: classes("od-graph-empty-state", className), role: role, children: [_jsx("span", { "aria-hidden": "true", className: "od-graph-empty-state-icon", children: icon }), _jsxs("div", { className: "od-graph-empty-state-copy", children: [_jsx(Heading, { id: titleId, children: title }), _jsx("div", { className: "od-graph-empty-state-description", children: description })] }), actions ? (_jsx("div", { className: "od-graph-empty-state-actions", children: actions })) : null] }));
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
/** A responsive inspector with initial focus, Escape close, and exact focus return. */
export function GraphInspector({ activationKey, title, eyebrow, icon, actions, onClose, onCancel, closeLabel = "Close inspector", initialFocusRef, returnFocusRef: suppliedReturnFocusRef, tone = "neutral", children, className, tabIndex, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...props }) {
    const titleId = useId();
    const inspectorRef = useRef(null);
    const headingRef = useRef(null);
    const [mode, setMode] = useState("overlay");
    const [hosted, setHosted] = useState(false);
    const modeRef = useRef("overlay");
    const modeTransitionRef = useRef(null);
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
            const splitBoundary = 69 * rootFontSize;
            const sheetBoundary = 48 * rootFontSize;
            const nextMode = width >= splitBoundary
                ? "split"
                : width > sheetBoundary
                    ? "overlay"
                    : "sheet";
            host.dataset.inspectorMode = nextMode;
            if (nextMode === modeRef.current)
                return;
            const content = inspector.querySelector(".od-graph-inspector-content");
            modeTransitionRef.current = {
                focus: inspector.contains(document.activeElement)
                    ? document.activeElement
                    : null,
                scrollTop: content?.scrollTop ?? 0,
            };
            modeRef.current = nextMode;
            setMode(nextMode);
        };
        const observer = new ResizeObserver(updateMode);
        observer.observe(host);
        observer.observe(remProbe);
        updateMode();
        return () => {
            observer.disconnect();
            remProbe.remove();
            delete host.dataset.inspectorMode;
        };
    }, []);
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
        const isModal = inspector.matches(":modal");
        if (mode === "sheet" && !isModal) {
            if (inspector.open)
                inspector.close();
            inspector.showModal();
            if (!inspector.contains(document.activeElement)) {
                headingRef.current?.focus({ preventScroll: true });
            }
        }
        else if (mode !== "sheet" && isModal) {
            inspector.close();
            inspector.show();
        }
        else if (!inspector.open) {
            inspector.show();
        }
        if (content)
            content.scrollTop = contentScrollTop;
        if (previousFocus?.isConnected) {
            previousFocus.focus({ preventScroll: true });
        }
    }, [mode]);
    function closeInspector() {
        const returnTarget = suppliedReturnFocusRef?.current ?? capturedReturnFocusRef.current;
        closeReturnFocusRef.current = returnTarget;
        const inspector = inspectorRef.current;
        if (inspector?.matches(":modal"))
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
            if (event.key === "Tab" && inspector.matches(":modal")) {
                const focusTargets = [
                    ...inspector.querySelectorAll(".od-graph-inspector-content, button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [role='button'], [tabindex]:not([tabindex='-1'])"),
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
                inspector.matches(":modal"))
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