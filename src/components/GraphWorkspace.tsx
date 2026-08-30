import type {
  ButtonHTMLAttributes,
  CSSProperties,
  DialogHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  RefObject,
  ReactNode,
  SVGAttributes,
  WheelEvent,
} from "react";
import {
  Children,
  Fragment,
  isValidElement,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  clampGraphPosition,
  clampGraphViewport,
  moveGraphPosition,
  zoomGraphViewportAtPoint,
  type GraphPoint,
  type GraphPositionBounds,
  type GraphViewportLimits,
  type GraphViewportValue,
} from "../GraphLayout.js";

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

function hasRenderedContent(value: ReactNode): boolean {
  let found = false;
  Children.forEach(value, (child) => {
    if (
      found ||
      child === null ||
      child === undefined ||
      typeof child === "boolean"
    ) {
      return;
    }
    if (typeof child === "string" && child.length === 0) return;
    if (
      isValidElement<{ readonly children?: ReactNode }>(child) &&
      child.type === Fragment
    ) {
      found = hasRenderedContent(child.props.children);
      return;
    }
    found = true;
  });
  return found;
}

export interface GraphWorkspaceProps extends HTMLAttributes<HTMLElement> {
  readonly toolbar?: ReactNode;
  readonly inspector?: ReactNode;
  readonly selectedControlRef?: RefObject<HTMLElement | null>;
  readonly fullPage?: boolean;
}

/** A full-width graph surface with floating controls and an optional inspector. */
export function GraphWorkspace({
  toolbar,
  inspector,
  selectedControlRef,
  fullPage = false,
  children,
  className,
  ...props
}: GraphWorkspaceProps) {
  const hostRef = useRef<HTMLElement>(null);
  useInspectorReachability(
    hostRef,
    selectedControlRef,
    inspector !== undefined && inspector !== null,
  );
  return (
    <section
      {...props}
      className={classes("od-graph-workspace", className)}
      data-full-page={fullPage}
      ref={hostRef}
    >
      {toolbar}
      <div className="od-graph-workspace-stage">{children}</div>
      {inspector}
    </section>
  );
}

export function useInspectorReachability(
  hostRef: RefObject<HTMLElement | null>,
  selectedControlRef: RefObject<HTMLElement | null> | undefined,
  active: boolean,
) {
  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host || !active) return;
    const keepReachable = () => {
      if (host.dataset.inspectorMode !== "overlay") return;
      const control = selectedControlRef?.current;
      if (!control?.isConnected) return;
      const viewport = control.closest<HTMLElement>(
        ".od-graph-viewport, .od-relationship-graph-viewport",
      );
      const inspector = host.querySelector<HTMLElement>(
        ".od-graph-inspector[data-mode='overlay']",
      );
      if (!viewport || !inspector) return;
      const controlBounds = control.getBoundingClientRect();
      const viewportBounds = viewport.getBoundingClientRect();
      const inspectorBounds = inspector.getBoundingClientRect();
      const visibleEnd = Math.min(viewportBounds.right, inspectorBounds.left);
      if (controlBounds.right > visibleEnd) {
        viewport.scrollLeft += controlBounds.right - visibleEnd;
      } else if (controlBounds.left < viewportBounds.left) {
        viewport.scrollLeft -= viewportBounds.left - controlBounds.left;
      }
    };
    const mutationObserver = new MutationObserver(keepReachable);
    mutationObserver.observe(host, {
      attributeFilter: ["data-inspector-mode"],
      attributes: true,
    });
    const geometryObserver =
      typeof globalThis.ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(keepReachable);
    const inspector = host.querySelector<HTMLElement>(".od-graph-inspector");
    if (inspector) geometryObserver?.observe(inspector);
    keepReachable();
    return () => {
      geometryObserver?.disconnect();
      mutationObserver.disconnect();
    };
  });
}

export interface GraphToolbarProps extends HTMLAttributes<HTMLElement> {
  readonly leading?: ReactNode;
  readonly center?: ReactNode;
  readonly actions?: ReactNode;
}

/** Floating graph controls. Each slot accepts host-owned controls and copy. */
export function GraphToolbar({
  leading,
  center,
  actions,
  className,
  ...props
}: GraphToolbarProps) {
  const hasLeading = hasRenderedContent(leading);
  const hasCenter = hasRenderedContent(center);
  const hasActions = hasRenderedContent(actions);
  return (
    <header
      {...props}
      className={classes("od-graph-toolbar", className)}
      data-actions={hasActions}
      data-center={hasCenter}
      data-leading={hasLeading}
    >
      {hasLeading ? (
        <div className="od-graph-toolbar-leading">{leading}</div>
      ) : null}
      {hasCenter ? (
        <div className="od-graph-toolbar-center">{center}</div>
      ) : null}
      {hasActions ? (
        <div className="od-graph-toolbar-actions">{actions}</div>
      ) : null}
    </header>
  );
}

export interface GraphViewportControlsProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  readonly onZoomIn?: () => void;
  readonly onZoomOut?: () => void;
  readonly onFitView?: () => void;
  readonly onAutomaticLayout?: () => void;
  readonly zoomInLabel?: string;
  readonly zoomOutLabel?: string;
  readonly fitViewLabel?: string;
  readonly automaticLayoutLabel?: string;
  readonly zoomInDisabled?: boolean;
  readonly zoomOutDisabled?: boolean;
  readonly fitViewDisabled?: boolean;
  readonly automaticLayoutDisabled?: boolean;
}

/** Shared, labelled controls for controlled graph view and layout actions. */
export function GraphViewportControls({
  onZoomIn,
  onZoomOut,
  onFitView,
  onAutomaticLayout,
  zoomInLabel = "Zoom in",
  zoomOutLabel = "Zoom out",
  fitViewLabel = "Fit view",
  automaticLayoutLabel = "Automatic layout",
  zoomInDisabled = false,
  zoomOutDisabled = false,
  fitViewDisabled = false,
  automaticLayoutDisabled = false,
  className,
  ...props
}: GraphViewportControlsProps) {
  return (
    <div
      {...props}
      aria-label={props["aria-label"] ?? "Graph view controls"}
      className={classes("od-graph-viewport-controls", className)}
      role={props.role ?? "group"}
    >
      {onZoomOut ? (
        <button
          aria-label={zoomOutLabel}
          disabled={zoomOutDisabled}
          onClick={onZoomOut}
          type="button"
        >
          −
        </button>
      ) : null}
      {onZoomIn ? (
        <button
          aria-label={zoomInLabel}
          disabled={zoomInDisabled}
          onClick={onZoomIn}
          type="button"
        >
          +
        </button>
      ) : null}
      {onFitView ? (
        <button disabled={fitViewDisabled} onClick={onFitView} type="button">
          {fitViewLabel}
        </button>
      ) : null}
      {onAutomaticLayout ? (
        <button
          disabled={automaticLayoutDisabled}
          onClick={onAutomaticLayout}
          type="button"
        >
          {automaticLayoutLabel}
        </button>
      ) : null}
    </div>
  );
}

export type GraphViewportChangeReason = "keyboard" | "pointer" | "wheel";

export interface GraphViewportProps extends HTMLAttributes<HTMLDivElement> {
  readonly canvasAlignment?: "start" | "center";
  readonly canvasWidth?: number | string;
  readonly canvasHeight?: number | string;
  readonly canvasClassName?: string;
  readonly canvasProps?: Omit<HTMLAttributes<HTMLDivElement>, "children">;
  readonly viewport?: GraphViewportValue;
  readonly viewportLimits?: GraphViewportLimits;
  readonly onViewportChange?: (
    viewport: GraphViewportValue,
    reason: GraphViewportChangeReason,
  ) => void;
  readonly panStep?: number;
  readonly zoomStep?: number;
  readonly connectionMode?: boolean;
  readonly onConnectionCancel?: () => void;
}

interface GraphPointerPan {
  pointerId: number;
  clientX: number;
  clientY: number;
  viewport: GraphViewportValue;
}

function usePreventGraphWheelDefault(
  viewportRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const element = viewportRef.current;
    if (!element || !enabled) return;
    const preventNativeWheel = (event: globalThis.WheelEvent) => {
      if (
        event.target instanceof Node &&
        element.contains(event.target) &&
        (event.deltaX !== 0 || event.deltaY !== 0)
      ) {
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
export function GraphViewport({
  canvasAlignment = "start",
  canvasWidth,
  canvasHeight,
  canvasClassName,
  canvasProps,
  viewport,
  viewportLimits,
  onViewportChange,
  panStep = 24,
  zoomStep = 0.1,
  connectionMode = false,
  onConnectionCancel,
  children,
  className,
  onClick,
  onKeyDown,
  onLostPointerCapture,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onWheel,
  role: suppliedRole,
  ...props
}: GraphViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerPanRef = useRef<GraphPointerPan | null>(null);
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
  const canvasStyle: CSSProperties = {
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

  function reportViewportChange(
    next: GraphViewportValue,
    reason: GraphViewportChangeReason,
  ) {
    const safeNext = clampGraphViewport(next, viewportLimits);
    if (
      safeNext.x !== controlledViewport?.x ||
      safeNext.y !== controlledViewport.y ||
      safeNext.zoom !== controlledViewport.zoom
    ) {
      onViewportChange?.(safeNext, reason);
    }
    return safeNext;
  }

  function zoomAtCenter(element: HTMLDivElement, zoom: number) {
    if (!controlledViewport) return;
    reportViewportChange(
      zoomGraphViewportAtPoint(
        controlledViewport,
        zoom,
        { x: element.clientWidth / 2, y: element.clientHeight / 2 },
        viewportLimits,
      ),
      "keyboard",
    );
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && connectionMode && onConnectionCancel) {
      event.preventDefault();
      onConnectionCancel();
      return;
    }
    if (!controlledViewport) return;
    const movementByKey: Record<string, GraphPoint | undefined> = {
      ArrowDown: { x: 0, y: panStep },
      ArrowLeft: { x: -panStep, y: 0 },
      ArrowRight: { x: panStep, y: 0 },
      ArrowUp: { x: 0, y: -panStep },
    };
    const movement = movementByKey[event.key];
    if (movement) {
      event.preventDefault();
      reportViewportChange(
        {
          ...controlledViewport,
          x: controlledViewport.x + movement.x,
          y: controlledViewport.y + movement.y,
        },
        "keyboard",
      );
      return;
    }
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomAtCenter(event.currentTarget, controlledViewport.zoom + zoomStep);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomAtCenter(event.currentTarget, controlledViewport.zoom - zoomStep);
    }
  }

  function isGraphBackground(target: EventTarget | null) {
    return (
      target instanceof Element &&
      (target.classList.contains("od-graph-viewport") ||
        target.classList.contains("od-graph-canvas"))
    );
  }

  function runViewportBackgroundAction(event: MouseEvent<HTMLDivElement>) {
    if (pointerMovedRef.current) {
      pointerMovedRef.current = false;
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (
      !event.defaultPrevented &&
      connectionMode &&
      onConnectionCancel &&
      isGraphBackground(event.target)
    ) {
      onConnectionCancel();
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    onPointerDown?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      !controlledViewport ||
      !isGraphBackground(event.target)
    ) {
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

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    onPointerMove?.(event);
    const pointerPan = pointerPanRef.current;
    if (event.defaultPrevented || pointerPan?.pointerId !== event.pointerId) {
      return;
    }
    if (
      event.clientX !== pointerPan.clientX ||
      event.clientY !== pointerPan.clientY
    ) {
      pointerMovedRef.current = true;
    }
    event.preventDefault();
    const safeNext = reportViewportChange(
      {
        ...pointerPan.viewport,
        x: pointerPan.viewport.x + event.clientX - pointerPan.clientX,
        y: pointerPan.viewport.y + event.clientY - pointerPan.clientY,
      },
      "pointer",
    );
    pointerPan.clientX = event.clientX;
    pointerPan.clientY = event.clientY;
    pointerPan.viewport = safeNext;
  }

  function finishPointerPan(event: PointerEvent<HTMLDivElement>) {
    const pointerPan = pointerPanRef.current;
    if (pointerPan?.pointerId === event.pointerId) {
      pointerPanRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    onPointerUp?.(event);
    finishPointerPan(event);
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    onPointerCancel?.(event);
    finishPointerPan(event);
    pointerMovedRef.current = false;
  }

  function handleLostPointerCapture(event: PointerEvent<HTMLDivElement>) {
    onLostPointerCapture?.(event);
    if (pointerPanRef.current?.pointerId === event.pointerId) {
      pointerPanRef.current = null;
    }
  }

  function changeViewportFromWheel(event: WheelEvent<HTMLDivElement>) {
    onWheel?.(event);
    if (event.defaultPrevented || !controlledViewport) return;
    if (event.ctrlKey || event.metaKey) {
      if (event.deltaY === 0) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const direction = event.deltaY > 0 ? -1 : 1;
      reportViewportChange(
        zoomGraphViewportAtPoint(
          controlledViewport,
          controlledViewport.zoom + direction * zoomStep,
          { x: event.clientX - bounds.left, y: event.clientY - bounds.top },
          viewportLimits,
        ),
        "wheel",
      );
      return;
    }
    if (event.deltaX === 0 && event.deltaY === 0) return;
    reportViewportChange(
      {
        ...controlledViewport,
        x: controlledViewport.x - event.deltaX,
        y: controlledViewport.y - event.deltaY,
      },
      "wheel",
    );
  }

  const viewportSemanticProps: HTMLAttributes<HTMLDivElement> = {
    role: suppliedRole ?? (controlledViewport ? "application" : "region"),
  };

  return (
    <div
      aria-label="Graph viewport"
      role="application"
      {...props}
      {...viewportSemanticProps}
      className={classes("od-graph-viewport", className)}
      data-canvas-alignment={canvasAlignment}
      data-connection-mode={connectionMode}
      data-pan-zoom={controlledViewport !== undefined}
      onClick={runViewportBackgroundAction}
      onKeyDown={handleKeyDown}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={changeViewportFromWheel}
      ref={viewportRef}
      tabIndex={controlledViewport ? (props.tabIndex ?? 0) : props.tabIndex}
    >
      <div
        {...canvasProps}
        className={classes(
          "od-graph-canvas",
          canvasClassName,
          canvasProps?.className,
        )}
        data-alignment={canvasAlignment}
        role={canvasProps?.role ?? "group"}
        style={canvasStyle}
      >
        {children}
      </div>
    </div>
  );
}

export interface GraphEmptyStateProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "title"
> {
  readonly icon: ReactNode;
  readonly title: ReactNode;
  readonly description: ReactNode;
  readonly actions?: ReactNode;
  readonly headingLevel?: "h2" | "h3";
}

/** An accessible empty state for a graph canvas. */
export function GraphEmptyState({
  actions,
  className,
  description,
  headingLevel = "h2",
  icon,
  role = "status",
  title,
  ...props
}: GraphEmptyStateProps) {
  const titleId = useId();
  const Heading = headingLevel;
  return (
    <div
      {...props}
      aria-labelledby={props["aria-labelledby"] ?? titleId}
      className={classes("od-graph-empty-state", className)}
      role={role}
    >
      <span aria-hidden="true" className="od-graph-empty-state-icon">
        {icon}
      </span>
      <div className="od-graph-empty-state-copy">
        <Heading id={titleId}>{title}</Heading>
        <div className="od-graph-empty-state-description">{description}</div>
      </div>
      {actions ? (
        <div className="od-graph-empty-state-actions">{actions}</div>
      ) : null}
    </div>
  );
}

export type GraphNodeTone =
  "neutral" | "lime" | "blue" | "purple" | "coral" | "amber";

export interface GraphNodeProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "title"
> {
  readonly x: number;
  readonly y: number;
  readonly title: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly icon?: ReactNode;
  readonly meta?: ReactNode;
  readonly selected?: boolean;
  readonly dragging?: boolean;
  readonly dropTarget?: boolean;
  readonly root?: boolean;
  readonly tone?: GraphNodeTone;
  readonly onPositionChange?: (
    position: GraphPoint,
    reason: "keyboard" | "pointer",
  ) => void;
  readonly positionBounds?: GraphPositionBounds;
  readonly keyboardMoveStep?: number;
  readonly viewportZoom?: number;
  readonly connectionTarget?: boolean;
  readonly onConnectionTarget?: () => void;
}

interface GraphNodePointerMove {
  pointerId: number;
  clientX: number;
  clientY: number;
  position: GraphPoint;
}

/** An accessible, controlled graph node with pointer and keyboard movement. */
export function GraphNode({
  x,
  y,
  title,
  eyebrow,
  icon,
  meta,
  selected = false,
  dragging = false,
  dropTarget = false,
  root = false,
  tone = "neutral",
  onPositionChange,
  positionBounds,
  keyboardMoveStep = 16,
  viewportZoom = 1,
  connectionTarget = false,
  onConnectionTarget,
  className,
  style,
  type = "button",
  onClick,
  onKeyDown,
  onLostPointerCapture,
  onPointerCancel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  ...props
}: GraphNodeProps) {
  const pointerMoveRef = useRef<GraphNodePointerMove | null>(null);
  const pointerMovedRef = useRef(false);
  if (!Number.isFinite(keyboardMoveStep) || keyboardMoveStep <= 0) {
    throw new Error(
      "Graph node keyboard movement step must be finite and positive.",
    );
  }
  if (!Number.isFinite(viewportZoom) || viewportZoom <= 0) {
    throw new Error("Graph node viewport zoom must be finite and positive.");
  }
  useLayoutEffect(() => {
    if (pointerMoveRef.current) {
      pointerMoveRef.current.position = { x, y };
    }
  }, [x, y]);

  function reportPosition(
    position: GraphPoint,
    reason: "keyboard" | "pointer",
  ) {
    const safePosition = positionBounds
      ? clampGraphPosition(position, positionBounds)
      : position;
    if (safePosition.x !== x || safePosition.y !== y) {
      onPositionChange?.(safePosition, reason);
    }
    return safePosition;
  }

  function runNodeAction(event: MouseEvent<HTMLButtonElement>) {
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

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !onPositionChange) return;
    const screenStep = keyboardMoveStep / viewportZoom;
    const movementByKey: Record<string, GraphPoint | undefined> = {
      ArrowDown: { x: 0, y: screenStep },
      ArrowLeft: { x: -screenStep, y: 0 },
      ArrowRight: { x: screenStep, y: 0 },
      ArrowUp: { x: 0, y: -screenStep },
    };
    const movement = movementByKey[event.key];
    if (!movement) return;
    event.preventDefault();
    reportPosition(
      moveGraphPosition({ x, y }, movement, positionBounds),
      "keyboard",
    );
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
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

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    onPointerMove?.(event);
    const pointerMove = pointerMoveRef.current;
    if (event.defaultPrevented || pointerMove?.pointerId !== event.pointerId) {
      return;
    }
    const delta = {
      x: (event.clientX - pointerMove.clientX) / viewportZoom,
      y: (event.clientY - pointerMove.clientY) / viewportZoom,
    };
    if (delta.x !== 0 || delta.y !== 0) pointerMovedRef.current = true;
    event.preventDefault();
    const safePosition = reportPosition(
      moveGraphPosition(pointerMove.position, delta, positionBounds),
      "pointer",
    );
    pointerMove.clientX = event.clientX;
    pointerMove.clientY = event.clientY;
    pointerMove.position = safePosition;
  }

  function finishPointerMove(event: PointerEvent<HTMLButtonElement>) {
    const pointerMove = pointerMoveRef.current;
    if (pointerMove?.pointerId === event.pointerId) {
      pointerMoveRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    onPointerUp?.(event);
    finishPointerMove(event);
  }

  function handlePointerCancel(event: PointerEvent<HTMLButtonElement>) {
    onPointerCancel?.(event);
    finishPointerMove(event);
    pointerMovedRef.current = false;
  }

  function handleLostPointerCapture(event: PointerEvent<HTMLButtonElement>) {
    onLostPointerCapture?.(event);
    if (pointerMoveRef.current?.pointerId === event.pointerId) {
      pointerMoveRef.current = null;
    }
  }

  return (
    <button
      {...props}
      aria-pressed={props["aria-pressed"] ?? selected}
      className={classes("od-graph-node", className)}
      data-connection-target={connectionTarget}
      data-root={root}
      data-selected={selected}
      data-dragging={dragging}
      data-drop-target={dropTarget}
      data-tone={tone}
      onClick={runNodeAction}
      onKeyDown={handleKeyDown}
      onLostPointerCapture={handleLostPointerCapture}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        ...style,
        transform: `translate(${String(x)}px, ${String(y)}px)`,
      }}
      type={type}
    >
      {icon ? <span className="od-graph-node-icon">{icon}</span> : null}
      <span className="od-graph-node-copy">
        {eyebrow ? (
          <span className="od-graph-node-eyebrow">{eyebrow}</span>
        ) : null}
        <strong className="od-graph-node-title">{title}</strong>
        {meta ? <span className="od-graph-node-meta">{meta}</span> : null}
      </span>
    </button>
  );
}

export interface GraphNodeActionProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "title"
> {
  readonly x: number;
  readonly y: number;
  readonly viewportZoom?: number;
  readonly "aria-label": string;
}

/** A separately focusable graph action that a host can place by one node. */
export function GraphNodeAction({
  x,
  y,
  viewportZoom = 1,
  className,
  style,
  type = "button",
  ...props
}: GraphNodeActionProps) {
  if (!Number.isFinite(viewportZoom) || viewportZoom <= 0) {
    throw new Error(
      "Graph node action viewport zoom must be finite and positive.",
    );
  }
  return (
    <button
      {...props}
      className={classes("od-graph-node-action", className)}
      style={{
        ...style,
        transform: `translate(${String(x)}px, ${String(y)}px) scale(${String(1 / viewportZoom)})`,
        transformOrigin: "0 0",
      }}
      type={type}
    />
  );
}

export interface GraphEdgesProps extends SVGAttributes<SVGSVGElement> {
  readonly width?: number | string;
  readonly height?: number | string;
}

/** The SVG layer below graph nodes. */
export function GraphEdges({
  width = "100%",
  height = "100%",
  className,
  children,
  ...props
}: GraphEdgesProps) {
  return (
    <svg
      {...props}
      className={classes("od-graph-edges", className)}
      height={height}
      width={width}
    >
      {children}
    </svg>
  );
}

interface GraphEdgeBaseProps extends Omit<
  SVGAttributes<SVGGElement>,
  "onSelect"
> {
  readonly path: string;
  readonly label?: string;
  readonly labelX?: number;
  readonly labelY?: number;
  readonly selected?: boolean;
  readonly dashed?: boolean;
  readonly directed?: boolean;
}

export type GraphEdgeProps = GraphEdgeBaseProps &
  (
    | { readonly onSelect: () => void; readonly "aria-label": string }
    | { readonly onSelect?: undefined }
  );

/** One visual graph connection. Supply onSelect and an aria-label for an interactive edge. */
export function GraphEdge({
  path,
  label,
  labelX,
  labelY,
  selected = false,
  dashed = false,
  directed = false,
  onSelect,
  className,
  onKeyDown,
  ...props
}: GraphEdgeProps) {
  const markerId = useId().replaceAll(":", "");
  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  const interactiveProps = onSelect
    ? { role: "button", tabIndex: props.tabIndex ?? 0 }
    : { "aria-hidden": true as const };

  return (
    <g
      {...props}
      {...interactiveProps}
      className={classes("od-graph-edge", className)}
      data-dashed={dashed}
      data-directed={directed}
      data-selected={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {directed ? (
        <defs>
          <marker
            id={markerId}
            markerHeight="8"
            markerUnits="strokeWidth"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path className="od-graph-edge-arrow" d="M 0 0 L 8 4 L 0 8 z" />
          </marker>
        </defs>
      ) : null}
      <path className="od-graph-edge-target" d={path} />
      <path
        className="od-graph-edge-line"
        d={path}
        markerEnd={directed ? `url(#${markerId})` : undefined}
      />
      {label && labelX !== undefined && labelY !== undefined ? (
        <g className="od-graph-edge-label">
          <text x={labelX} y={labelY}>
            {label}
          </text>
        </g>
      ) : null}
    </g>
  );
}

export interface GraphBundledLinkProps extends Omit<
  SVGAttributes<SVGGElement>,
  "onSelect"
> {
  readonly pathA: string;
  readonly pathB: string;
  readonly junctionX: number;
  readonly junctionY: number;
  readonly label: string;
  readonly endpointALabel?: string;
  readonly endpointBLabel?: string;
  readonly selected?: boolean;
  readonly onSelect: () => void;
  readonly "aria-label": string;
}

/** One selectable link junction with labelled endpoint A and B branches. */
export function GraphBundledLink({
  pathA,
  pathB,
  junctionX,
  junctionY,
  label,
  endpointALabel = "A",
  endpointBLabel = "B",
  selected = false,
  onSelect,
  className,
  onKeyDown,
  ...props
}: GraphBundledLinkProps) {
  function handleKeyDown(event: KeyboardEvent<SVGGElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  }

  return (
    <g
      {...props}
      aria-pressed={props["aria-pressed"] ?? selected}
      className={classes("od-graph-bundled-link", className)}
      data-selected={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={props.tabIndex ?? 0}
    >
      <path className="od-graph-bundled-link-target" d={pathA} />
      <path className="od-graph-bundled-link-target" d={pathB} />
      <path
        className="od-graph-bundled-link-branch"
        d={pathA}
        data-endpoint="A"
      />
      <path
        className="od-graph-bundled-link-branch"
        d={pathB}
        data-endpoint="B"
      />
      <g
        className="od-graph-bundled-link-junction"
        transform={`translate(${String(junctionX)} ${String(junctionY)})`}
      >
        <rect height="40" rx="8" width="112" x="-56" y="-20" />
        <text className="od-graph-bundled-link-endpoint" x="-45" y="4">
          {endpointALabel}
        </text>
        <text className="od-graph-bundled-link-label" x="0" y="4">
          {label}
        </text>
        <text className="od-graph-bundled-link-endpoint" x="45" y="4">
          {endpointBLabel}
        </text>
      </g>
    </g>
  );
}

export interface GraphInspectorProps extends Omit<
  DialogHTMLAttributes<HTMLDialogElement>,
  "onClose" | "open" | "title"
> {
  readonly activationKey?: string | number;
  readonly title: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly icon?: ReactNode;
  readonly actions?: ReactNode;
  readonly onClose?: () => void;
  readonly closeLabel?: string;
  readonly initialFocusRef?: RefObject<HTMLElement | null>;
  readonly returnFocusRef?: RefObject<HTMLElement | null>;
  readonly tone?: GraphNodeTone;
}

function restoreInspectorFocus(target: HTMLElement | null) {
  if (!target?.isConnected) return;
  const apply = () => {
    const active = document.activeElement;
    if (
      active instanceof HTMLElement &&
      active !== document.body &&
      active !== document.documentElement
    )
      return;
    if (target.isConnected) target.focus({ preventScroll: true });
  };
  if (typeof requestAnimationFrame === "function")
    requestAnimationFrame(() => requestAnimationFrame(apply));
  else apply();
}

function findInspectorFocusFallback(
  inspector: HTMLDialogElement,
): HTMLElement | null {
  const host = inspector.parentElement?.closest<HTMLElement>(
    ".od-graph-workspace, .od-relationship-graph",
  );
  if (!host) return null;
  const selectors = [
    ":is(.od-graph-viewport, .od-relationship-graph-viewport) [data-selected='true']:not(:disabled)",
    ":is(.od-graph-viewport, .od-relationship-graph-viewport) [tabindex='0']:not(:disabled)",
    ":is(.od-graph-viewport, .od-relationship-graph-viewport) :is(button:not(:disabled), a[href], [tabindex]:not([tabindex='-1']))",
  ];
  for (const selector of selectors) {
    const target = host.querySelector<HTMLElement>(selector);
    if (target?.isConnected) return target;
  }
  return null;
}

function isModalDialog(inspector: HTMLDialogElement) {
  try {
    return inspector.matches(":modal");
  } catch {
    return false;
  }
}

function focusInspector(
  inspector: HTMLDialogElement,
  heading: HTMLElement | null,
  initialFocusRef?: RefObject<HTMLElement | null>,
) {
  const suppliedInitialFocus = initialFocusRef?.current;
  const initialFocus =
    heading ??
    (suppliedInitialFocus && inspector.contains(suppliedInitialFocus)
      ? suppliedInitialFocus
      : null) ??
    inspector.querySelector<HTMLElement>("[data-graph-inspector-close]") ??
    inspector.querySelector<HTMLElement>(
      "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
    ) ??
    inspector;
  initialFocus.focus({ preventScroll: true });
}

type GraphInspectorMode = "split" | "overlay" | "sheet";

function useGraphInspectorMode(
  inspectorRef: RefObject<HTMLDialogElement | null>,
  headingRef: RefObject<HTMLHeadingElement | null>,
) {
  const [mode, setMode] = useState<GraphInspectorMode>("overlay");
  const [hosted, setHosted] = useState(false);
  const modeRef = useRef<GraphInspectorMode>("overlay");
  const modeTransitionRef = useRef<{
    readonly focus: HTMLElement | null;
    readonly focusWasInside: boolean;
    readonly scrollTop: number;
  } | null>(null);
  const lastInspectorFocusRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      const inspector = inspectorRef.current;
      const target = event.target;
      if (!inspector || !(target instanceof HTMLElement)) return;
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
    const host = inspector?.parentElement?.closest<HTMLElement>(
      ".od-graph-workspace, .od-relationship-graph",
    );
    if (!inspector || !host) return;
    setHosted(true);
    const remProbe = document.createElement("span");
    remProbe.ariaHidden = "true";
    remProbe.className = "od-graph-inspector-rem-probe";
    host.append(remProbe);
    const updateMode = () => {
      const width = host.clientWidth;
      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      );
      const nextMode =
        width >= 69 * rootFontSize
          ? "split"
          : width > 48 * rootFontSize
            ? "overlay"
            : "sheet";
      host.dataset.inspectorMode = nextMode;
      if (nextMode === modeRef.current) return;
      const content = inspector.querySelector<HTMLElement>(
        ".od-graph-inspector-content",
      );
      const active = document.activeElement;
      const activeIsInside =
        active instanceof HTMLElement && inspector.contains(active);
      const lastInspectorFocus = lastInspectorFocusRef.current;
      const focusWasInside =
        activeIsInside ||
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
    const observer =
      typeof globalThis.ResizeObserver === "undefined"
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
    if (!inspector) return;
    const content = inspector.querySelector<HTMLElement>(
      ".od-graph-inspector-content",
    );
    const transition = modeTransitionRef.current;
    modeTransitionRef.current = null;
    const contentScrollTop = transition?.scrollTop ?? content?.scrollTop ?? 0;
    const previousFocus =
      transition?.focus ??
      (inspector.contains(document.activeElement)
        ? (document.activeElement as HTMLElement)
        : null);
    const isModal = isModalDialog(inspector);
    if (
      mode === "sheet" &&
      !isModal &&
      typeof inspector.showModal === "function"
    ) {
      if (inspector.open) inspector.close();
      inspector.showModal();
    } else if (mode !== "sheet" && isModal) {
      inspector.close();
      if (typeof inspector.show === "function") inspector.show();
    } else if (!inspector.open && typeof inspector.show === "function") {
      inspector.show();
    }
    if (content) content.scrollTop = contentScrollTop;
    if (
      transition?.focusWasInside &&
      (!previousFocus?.isConnected || !inspector.contains(previousFocus))
    ) {
      headingRef.current?.focus({ preventScroll: true });
    } else if (transition !== null && !transition.focusWasInside) {
      if (mode === "sheet") headingRef.current?.focus({ preventScroll: true });
    } else if (previousFocus?.isConnected) {
      previousFocus.focus({ preventScroll: true });
    } else if (
      mode === "sheet" &&
      !inspector.contains(document.activeElement)
    ) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [headingRef, inspectorRef, mode]);

  return { hosted, mode };
}

/** A responsive inspector with initial focus, Escape close, and exact focus return. */
export function GraphInspector({
  activationKey,
  title,
  eyebrow,
  icon,
  actions,
  onClose,
  onCancel,
  closeLabel = "Close inspector",
  initialFocusRef,
  returnFocusRef: suppliedReturnFocusRef,
  tone = "neutral",
  children,
  className,
  tabIndex,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: GraphInspectorProps) {
  const titleId = useId();
  const inspectorRef = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { hosted, mode } = useGraphInspectorMode(inspectorRef, headingRef);
  const capturedReturnFocusRef = useRef<HTMLElement | null>(null);
  const closeReturnFocusRef = useRef<HTMLElement | null>(null);
  const latestSuppliedReturnFocusRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const target = suppliedReturnFocusRef?.current;
    if (!target?.isConnected) return;
    const previousTarget = latestSuppliedReturnFocusRef.current;
    latestSuppliedReturnFocusRef.current = target;
    const inspector = inspectorRef.current;
    if (
      previousTarget === null ||
      previousTarget === target ||
      !inspector ||
      inspector.contains(document.activeElement)
    )
      return;
    capturedReturnFocusRef.current = target;
    focusInspector(inspector, headingRef.current, initialFocusRef);
  });

  useLayoutEffect(() => {
    const inspector = inspectorRef.current;
    if (!inspector) return;
    closeReturnFocusRef.current = null;
    const suppliedReturnFocus = suppliedReturnFocusRef?.current;
    if (suppliedReturnFocus?.isConnected) {
      capturedReturnFocusRef.current = suppliedReturnFocus;
    } else {
      const active = document.activeElement;
      if (active instanceof HTMLElement && !inspector.contains(active)) {
        capturedReturnFocusRef.current = active;
      }
    }
    focusInspector(inspector, headingRef.current, initialFocusRef);
    return () => {
      const returnTarget =
        closeReturnFocusRef.current ??
        latestSuppliedReturnFocusRef.current ??
        capturedReturnFocusRef.current;
      const element = inspector;
      const apply = () => {
        if (!element.isConnected) restoreInspectorFocus(returnTarget);
      };
      if (typeof requestAnimationFrame === "function")
        requestAnimationFrame(apply);
      else apply();
    };
  }, [activationKey, initialFocusRef, suppliedReturnFocusRef]);

  function closeInspector() {
    const requestedReturnTarget =
      suppliedReturnFocusRef?.current ?? capturedReturnFocusRef.current;
    const returnTarget = requestedReturnTarget?.isConnected
      ? requestedReturnTarget
      : inspectorRef.current
        ? findInspectorFocusFallback(inspectorRef.current)
        : null;
    closeReturnFocusRef.current = returnTarget;
    const inspector = inspectorRef.current;
    if (inspector && isModalDialog(inspector)) inspector.close();
    onClose?.();
    if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
    restoreInspectorFocus(returnTarget);
  }

  const handleInspectorKeyboardRef = useRef<
    (event: globalThis.KeyboardEvent) => void
  >(() => undefined);

  useLayoutEffect(() => {
    handleInspectorKeyboardRef.current = (event: globalThis.KeyboardEvent) => {
      const inspector = inspectorRef.current;
      if (
        !inspector ||
        event.defaultPrevented ||
        !(event.target instanceof Node) ||
        !inspector.contains(event.target)
      )
        return;
      if (event.key === "Tab" && isModalDialog(inspector)) {
        const focusTargets = [
          ...inspector.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled):not([type='hidden']), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])",
          ),
        ].filter(
          (element) =>
            element !== inspector &&
            element.getAttribute("aria-hidden") !== "true" &&
            element.getClientRects().length > 0,
        );
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
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: true });
        return;
      }
      if (
        event.key !== "Escape" ||
        onClose === undefined ||
        isModalDialog(inspector)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      closeInspector();
    };
  });

  useLayoutEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      handleInspectorKeyboardRef.current(event);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <dialog
      {...props}
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabel === undefined ? (ariaLabelledBy ?? titleId) : undefined
      }
      className={classes("od-graph-inspector", className)}
      data-hosted={hosted}
      data-mode={mode}
      data-tone={tone}
      open
      onCancel={(event) => {
        onCancel?.(event);
        if (event.defaultPrevented || onClose === undefined) return;
        event.preventDefault();
        closeInspector();
      }}
      ref={inspectorRef}
      tabIndex={tabIndex ?? -1}
    >
      <header className="od-graph-inspector-header">
        {icon ? <span className="od-graph-inspector-icon">{icon}</span> : null}
        <div className="od-graph-inspector-heading">
          {eyebrow ? (
            <span className="od-graph-inspector-eyebrow">{eyebrow}</span>
          ) : null}
          <h2 id={titleId} ref={headingRef} tabIndex={-1}>
            {title}
          </h2>
        </div>
        {onClose ? (
          <button
            aria-label={closeLabel}
            className="od-graph-inspector-close"
            data-graph-inspector-close="true"
            onClick={closeInspector}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        ) : null}
      </header>
      <div className="od-graph-inspector-content">{children}</div>
      {actions ? (
        <footer className="od-graph-inspector-actions">{actions}</footer>
      ) : null}
    </dialog>
  );
}
