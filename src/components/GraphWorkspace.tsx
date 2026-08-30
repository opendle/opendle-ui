import type {
  ButtonHTMLAttributes,
  CSSProperties,
  DialogHTMLAttributes,
  HTMLAttributes,
  KeyboardEvent,
  RefObject,
  ReactNode,
  SVGAttributes,
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
}

/** A full-width graph surface with floating controls and an optional inspector. */
export function GraphWorkspace({
  toolbar,
  inspector,
  selectedControlRef,
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
    const geometryObserver = new ResizeObserver(keepReachable);
    const inspector = host.querySelector<HTMLElement>(".od-graph-inspector");
    if (inspector) geometryObserver.observe(inspector);
    keepReachable();
    return () => {
      geometryObserver.disconnect();
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

export interface GraphViewportProps extends HTMLAttributes<HTMLDivElement> {
  readonly canvasAlignment?: "start" | "center";
  readonly canvasWidth?: number | string;
  readonly canvasHeight?: number | string;
  readonly canvasClassName?: string;
  readonly canvasProps?: Omit<HTMLAttributes<HTMLDivElement>, "children">;
}

/** A scrollable viewport and a positioned canvas for nodes and edges. */
export function GraphViewport({
  canvasAlignment = "start",
  canvasWidth,
  canvasHeight,
  canvasClassName,
  canvasProps,
  children,
  className,
  ...props
}: GraphViewportProps) {
  const canvasStyle: CSSProperties = {
    ...canvasProps?.style,
    height: canvasHeight,
    width: canvasWidth,
  };

  return (
    <div
      {...props}
      className={classes("od-graph-viewport", className)}
      data-canvas-alignment={canvasAlignment}
      role={props.role ?? "region"}
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
}

/** An accessible positioned graph node. Arrow-key movement stays host-owned. */
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
  className,
  style,
  type = "button",
  ...props
}: GraphNodeProps) {
  return (
    <button
      {...props}
      aria-pressed={props["aria-pressed"] ?? selected}
      className={classes("od-graph-node", className)}
      data-root={root}
      data-selected={selected}
      data-dragging={dragging}
      data-drop-target={dropTarget}
      data-tone={tone}
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
  onSelect,
  className,
  onKeyDown,
  ...props
}: GraphEdgeProps) {
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
      data-selected={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      <path className="od-graph-edge-target" d={path} />
      <path className="od-graph-edge-line" d={path} />
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
  const [mode, setMode] = useState<"split" | "overlay" | "sheet">("overlay");
  const [hosted, setHosted] = useState(false);
  const modeRef = useRef<"split" | "overlay" | "sheet">("overlay");
  const modeTransitionRef = useRef<{
    readonly focus: HTMLElement | null;
    readonly scrollTop: number;
  } | null>(null);
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
      const splitBoundary = 69 * rootFontSize;
      const sheetBoundary = 48 * rootFontSize;
      const nextMode =
        width >= splitBoundary
          ? "split"
          : width > sheetBoundary
            ? "overlay"
            : "sheet";
      host.dataset.inspectorMode = nextMode;
      if (nextMode === modeRef.current) return;
      const content = inspector.querySelector<HTMLElement>(
        ".od-graph-inspector-content",
      );
      modeTransitionRef.current = {
        focus: inspector.contains(document.activeElement)
          ? (document.activeElement as HTMLElement)
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
    const isModal = inspector.matches(":modal");
    if (mode === "sheet" && !isModal) {
      if (inspector.open) inspector.close();
      inspector.showModal();
      if (!inspector.contains(document.activeElement)) {
        headingRef.current?.focus({ preventScroll: true });
      }
    } else if (mode !== "sheet" && isModal) {
      inspector.close();
      inspector.show();
    } else if (!inspector.open) {
      inspector.show();
    }
    if (content) content.scrollTop = contentScrollTop;
    if (previousFocus?.isConnected) {
      previousFocus.focus({ preventScroll: true });
    }
  }, [mode]);

  function closeInspector() {
    const returnTarget =
      suppliedReturnFocusRef?.current ?? capturedReturnFocusRef.current;
    closeReturnFocusRef.current = returnTarget;
    const inspector = inspectorRef.current;
    if (inspector?.matches(":modal")) inspector.close();
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
      if (event.key === "Tab" && inspector.matches(":modal")) {
        const focusTargets = [
          ...inspector.querySelectorAll<HTMLElement>(
            ".od-graph-inspector-content, button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [role='button'], [tabindex]:not([tabindex='-1'])",
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
        inspector.matches(":modal")
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
