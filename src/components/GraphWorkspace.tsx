import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
  SVGAttributes,
} from "react";
import { useId } from "react";

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
  readonly canvasWidth?: number | string;
  readonly canvasHeight?: number | string;
  readonly canvasClassName?: string;
  readonly canvasProps?: Omit<HTMLAttributes<HTMLDivElement>, "children">;
}

/** A scrollable viewport and a positioned canvas for nodes and edges. */
export function GraphViewport({
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
    <div {...props} className={classes("od-graph-viewport", className)}>
      <div
        {...canvasProps}
        className={classes(
          "od-graph-canvas",
          canvasClassName,
          canvasProps?.className,
        )}
        role={canvasProps?.role ?? "group"}
        style={canvasStyle}
      >
        {children}
      </div>
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
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly icon?: ReactNode;
  readonly actions?: ReactNode;
  readonly onClose?: () => void;
  readonly closeLabel?: string;
  readonly tone?: GraphNodeTone;
}

/** A responsive inspector which floats on wide screens and docks on small screens. */
export function GraphInspector({
  title,
  eyebrow,
  icon,
  actions,
  onClose,
  closeLabel = "Close inspector",
  tone = "neutral",
  children,
  className,
  ...props
}: GraphInspectorProps) {
  const titleId = useId();
  return (
    <aside
      {...props}
      aria-labelledby={props["aria-label"] ? undefined : titleId}
      className={classes("od-graph-inspector", className)}
      data-tone={tone}
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
            onClick={onClose}
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
    </aside>
  );
}
