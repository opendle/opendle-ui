import type { HTMLAttributes, ReactNode } from "react";
import { useId, useLayoutEffect, useRef } from "react";

function classes(...values: (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

function useFactsFit() {
  const factsRef = useRef<HTMLDListElement>(null);
  useLayoutEffect(() => {
    const facts = factsRef.current;
    if (!facts) return;
    const view = facts.ownerDocument.defaultView;
    if (!view) return;
    let frame = 0;
    let active = true;
    const observed = new Set<Element>();
    const measure = () => {
      frame = 0;
      if (!active) return;
      const rows = [
        ...facts.querySelectorAll<HTMLElement>(".od-graph-inspector-fact"),
      ].filter((row) => row.closest(".od-graph-inspector-facts") === facts);
      const cells = rows.flatMap((row) => [...row.children]);
      const current = new Set<Element>([facts, ...cells]);
      for (const element of observed) {
        if (!current.has(element)) {
          resizeObserver?.unobserve(element);
          observed.delete(element);
        }
      }
      for (const element of current) {
        if (!observed.has(element)) {
          resizeObserver?.observe(element);
          observed.add(element);
        }
      }
      // Measure the normal break opportunities in the actual styled content.
      // The temporary state ends before paint and never replaces a DOM node.
      facts.dataset.measuringFit = "true";
      let stacked = false;
      try {
        stacked = rows.some((row) => {
          const [term, description] = row.children;
          if (!term || !description || !row.getClientRects().length)
            return false;
          const style = view.getComputedStyle(row);
          const [termTrack = 0, valueTrack = 0] = style.gridTemplateColumns
            .split(" ")
            .map(Number.parseFloat);
          const requiredWidth =
            termTrack +
            valueTrack +
            Number.parseFloat(style.columnGap) +
            Number.parseFloat(style.paddingInlineStart) +
            Number.parseFloat(style.paddingInlineEnd);
          return (
            requiredWidth > row.clientWidth + 0.5 ||
            term.getBoundingClientRect().width > termTrack + 0.01 ||
            description.getBoundingClientRect().width > valueTrack + 0.01
          );
        });
      } finally {
        delete facts.dataset.measuringFit;
      }
      const layout = stacked ? "stacked" : "columns";
      if (facts.dataset.factLayout !== layout)
        facts.dataset.factLayout = layout;
    };
    const schedule = () => {
      if (active && !frame) frame = view.requestAnimationFrame(measure);
    };
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    const mutations = new MutationObserver(schedule);
    mutations.observe(facts, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["class", "style", "dir", "lang", "hidden"],
    });
    // Observe only this group's ancestor attributes, not other document content.
    for (
      let ancestor = facts.parentElement;
      ancestor;
      ancestor = ancestor.parentElement
    ) {
      mutations.observe(ancestor, {
        attributes: true,
        attributeFilter: ["class", "style", "dir", "lang", "hidden"],
      });
    }
    const fonts = facts.ownerDocument.fonts;
    fonts.addEventListener("loadingdone", schedule);
    fonts.addEventListener("loadingerror", schedule);
    void fonts.ready.then(schedule);
    view.addEventListener("resize", schedule);
    measure();
    return () => {
      active = false;
      view.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      mutations.disconnect();
      fonts.removeEventListener("loadingdone", schedule);
      fonts.removeEventListener("loadingerror", schedule);
      view.removeEventListener("resize", schedule);
    };
  }, []);
  return factsRef;
}

export type GraphInspectorFactsProps = HTMLAttributes<HTMLDListElement>;
export function GraphInspectorFacts({
  className,
  ...props
}: GraphInspectorFactsProps) {
  const ref = useFactsFit();
  return (
    <dl
      {...props}
      ref={ref}
      className={classes("od-graph-inspector-facts", className)}
    />
  );
}

export interface GraphInspectorFactProps extends HTMLAttributes<HTMLDivElement> {
  readonly label: ReactNode;
  readonly value: ReactNode;
}
export function GraphInspectorFact({
  label,
  value,
  className,
  ...props
}: GraphInspectorFactProps) {
  return (
    <div {...props} className={classes("od-graph-inspector-fact", className)}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export interface GraphInspectorSectionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  readonly title: ReactNode;
  readonly count?: ReactNode;
}
export function GraphInspectorSection({
  title,
  count,
  children,
  className,
  ...props
}: GraphInspectorSectionProps) {
  const titleId = useId();
  return (
    <section
      {...props}
      aria-labelledby={titleId}
      className={classes("od-graph-inspector-section", className)}
    >
      <h3 id={titleId}>
        {title}
        {count === undefined ? null : (
          <span className="od-graph-inspector-section-count">{count}</span>
        )}
      </h3>
      <div className="od-graph-inspector-section-content">{children}</div>
    </section>
  );
}

export type GraphInspectorRowsProps = HTMLAttributes<HTMLUListElement>;
export function GraphInspectorRows({
  className,
  ...props
}: GraphInspectorRowsProps) {
  return (
    <ul {...props} className={classes("od-graph-inspector-rows", className)} />
  );
}

export interface GraphInspectorRowProps extends HTMLAttributes<HTMLLIElement> {
  readonly label: ReactNode;
  readonly value?: ReactNode;
  readonly actions?: ReactNode;
}
export function GraphInspectorRow({
  label,
  value,
  actions,
  className,
  ...props
}: GraphInspectorRowProps) {
  return (
    <li {...props} className={classes("od-graph-inspector-row", className)}>
      <div className="od-graph-inspector-row-copy">
        <strong>{label}</strong>
        {value === undefined ? null : <span>{value}</span>}
      </div>
      {actions === undefined ? null : (
        <div className="od-graph-inspector-row-actions">{actions}</div>
      )}
    </li>
  );
}

export type GraphInspectorNoticeTone = "neutral" | "warning" | "error";
export interface GraphInspectorNoticeProps extends HTMLAttributes<HTMLDivElement> {
  readonly tone?: GraphInspectorNoticeTone;
  readonly dynamic?: boolean;
}
export function GraphInspectorNotice({
  tone = "neutral",
  dynamic = false,
  children,
  className,
  ...props
}: GraphInspectorNoticeProps) {
  const stateLabel =
    tone === "warning" ? "Warning" : tone === "error" ? "Error" : null;
  return (
    <div
      {...props}
      className={classes("od-graph-inspector-notice", className)}
      data-tone={tone}
      role={dynamic && tone === "error" ? "alert" : props.role}
    >
      {stateLabel === null ? null : (
        <strong className="od-graph-inspector-notice-state">
          {stateLabel}:
        </strong>
      )}
      <div className="od-graph-inspector-notice-content">{children}</div>
    </div>
  );
}
