import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useLayoutEffect, useRef } from "react";
function classes(...values) {
    return values.filter(Boolean).join(" ");
}
function useFactsFit() {
    const factsRef = useRef(null);
    useLayoutEffect(() => {
        const facts = factsRef.current;
        if (!facts)
            return;
        const view = facts.ownerDocument.defaultView;
        if (!view)
            return;
        let frame = 0;
        let active = true;
        const observed = new Set();
        const measure = () => {
            frame = 0;
            if (!active)
                return;
            const rows = [
                ...facts.querySelectorAll(".od-graph-inspector-fact"),
            ].filter((row) => row.closest(".od-graph-inspector-facts") === facts);
            const cells = rows.flatMap((row) => [...row.children]);
            const current = new Set([facts, ...cells]);
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
                    const requiredWidth = termTrack +
                        valueTrack +
                        Number.parseFloat(style.columnGap) +
                        Number.parseFloat(style.paddingInlineStart) +
                        Number.parseFloat(style.paddingInlineEnd);
                    return (requiredWidth > row.clientWidth + 0.5 ||
                        term.getBoundingClientRect().width > termTrack + 0.01 ||
                        description.getBoundingClientRect().width > valueTrack + 0.01);
                });
            }
            finally {
                delete facts.dataset.measuringFit;
            }
            const layout = stacked ? "stacked" : "columns";
            if (facts.dataset.factLayout !== layout)
                facts.dataset.factLayout = layout;
        };
        const schedule = () => {
            if (active && !frame)
                frame = view.requestAnimationFrame(measure);
        };
        const resizeObserver = typeof ResizeObserver === "undefined"
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
        for (let ancestor = facts.parentElement; ancestor; ancestor = ancestor.parentElement) {
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
export function GraphInspectorFacts({ className, ...props }) {
    const ref = useFactsFit();
    return (_jsx("dl", { ...props, ref: ref, className: classes("od-graph-inspector-facts", className) }));
}
export function GraphInspectorFact({ label, value, className, ...props }) {
    return (_jsxs("div", { ...props, className: classes("od-graph-inspector-fact", className), children: [_jsx("dt", { children: label }), _jsx("dd", { children: value })] }));
}
export function GraphInspectorSection({ title, count, children, className, ...props }) {
    const titleId = useId();
    return (_jsxs("section", { ...props, "aria-labelledby": titleId, className: classes("od-graph-inspector-section", className), children: [_jsxs("h3", { id: titleId, children: [title, count === undefined ? null : (_jsx("span", { className: "od-graph-inspector-section-count", children: count }))] }), _jsx("div", { className: "od-graph-inspector-section-content", children: children })] }));
}
export function GraphInspectorRows({ className, ...props }) {
    return (_jsx("ul", { ...props, className: classes("od-graph-inspector-rows", className) }));
}
export function GraphInspectorRow({ label, value, actions, className, ...props }) {
    return (_jsxs("li", { ...props, className: classes("od-graph-inspector-row", className), children: [_jsxs("div", { className: "od-graph-inspector-row-copy", children: [_jsx("strong", { children: label }), value === undefined ? null : _jsx("span", { children: value })] }), actions === undefined ? null : (_jsx("div", { className: "od-graph-inspector-row-actions", children: actions }))] }));
}
export function GraphInspectorNotice({ tone = "neutral", dynamic = false, children, className, ...props }) {
    const stateLabel = tone === "warning" ? "Warning" : tone === "error" ? "Error" : null;
    return (_jsxs("div", { ...props, className: classes("od-graph-inspector-notice", className), "data-tone": tone, role: dynamic && tone === "error" ? "alert" : props.role, children: [stateLabel === null ? null : (_jsxs("strong", { className: "od-graph-inspector-notice-state", children: [stateLabel, ":"] })), _jsx("div", { className: "od-graph-inspector-notice-content", children: children })] }));
}
//# sourceMappingURL=GraphInspectorPrimitives.js.map