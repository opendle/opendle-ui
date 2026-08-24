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
import { useId, useLayoutEffect, useRef } from "react";

function classes(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

export interface GraphWorkspaceProps extends HTMLAttributes<HTMLElement> {
  readonly toolbar?: ReactNode;
  readonly inspector?: ReactNode;
}

/** A full-width graph surface with floating controls and an optional inspector. */
export function GraphWorkspace({
  toolbar,
  inspector,
  children,
  className,
  ...props
}: GraphWorkspaceProps) {
  return (
    <section {...props} className={classes("od-graph-workspace", className)}>
      {toolbar}
      <div className="od-graph-workspace-stage">{children}</div>
      {inspector}
    </section>
  );
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
  return (
    <header {...props} className={classes("od-graph-toolbar", className)}>
      {leading ? (
        <div className="od-graph-toolbar-leading">{leading}</div>
      ) : null}
      {center ? <div className="od-graph-toolbar-center">{center}</div> : null}
      {actions ? (
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
      active.closest(".od-graph-inspector, dialog[open]")
    )
      return;
    if (target.isConnected) target.focus({ preventScroll: true });
  };
  if (typeof requestAnimationFrame === "function") requestAnimationFrame(apply);
  else apply();
}

/** A responsive inspector with initial focus, Escape close, and exact focus return. */
export function GraphInspector({
  activationKey,
  title,
  eyebrow,
  icon,
  actions,
  onClose,
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
  const capturedReturnFocusRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const inspector = inspectorRef.current;
    if (!inspector) return;
    const suppliedReturnFocus = suppliedReturnFocusRef?.current;
    if (suppliedReturnFocus?.isConnected) {
      capturedReturnFocusRef.current = suppliedReturnFocus;
    } else {
      const active = document.activeElement;
      if (active instanceof HTMLElement && !inspector.contains(active)) {
        capturedReturnFocusRef.current = active;
      }
    }
    const initialFocus =
      initialFocusRef?.current ??
      inspector.querySelector<HTMLElement>("[data-graph-inspector-close]") ??
      inspector.querySelector<HTMLElement>(
        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])",
      ) ??
      inspector;
    initialFocus.focus({ preventScroll: true });
    return () => {
      const returnTarget =
        suppliedReturnFocus ?? capturedReturnFocusRef.current;
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
    const returnTarget =
      suppliedReturnFocusRef?.current ?? capturedReturnFocusRef.current;
    onClose?.();
    if (returnTarget?.isConnected) returnTarget.focus({ preventScroll: true });
    restoreInspectorFocus(returnTarget);
  }

  const handleInspectorEscapeRef = useRef<
    (event: globalThis.KeyboardEvent) => void
  >(() => undefined);

  useLayoutEffect(() => {
    handleInspectorEscapeRef.current = (event: globalThis.KeyboardEvent) => {
      const inspector = inspectorRef.current;
      if (
        !inspector ||
        onClose === undefined ||
        event.defaultPrevented ||
        event.key !== "Escape" ||
        !(event.target instanceof Node) ||
        !inspector.contains(event.target)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      closeInspector();
    };
  });

  useLayoutEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      handleInspectorEscapeRef.current(event);
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
      data-tone={tone}
      open
      ref={inspectorRef}
      tabIndex={tabIndex ?? -1}
    >
      <header className="od-graph-inspector-header">
        {icon ? <span className="od-graph-inspector-icon">{icon}</span> : null}
        <div className="od-graph-inspector-heading">
          {eyebrow ? (
            <span className="od-graph-inspector-eyebrow">{eyebrow}</span>
          ) : null}
          <h2 id={titleId}>{title}</h2>
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
