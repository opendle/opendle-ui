import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useId, useLayoutEffect, useRef, } from "react";
/** A responsive application frame with caller-owned content and controls. */
export function ApplicationShell({ children, className, mainProps, mobileNavigation, sidebar, topbar, ...props }) {
    const shellRef = useRef(null);
    const navigationRef = useRef(null);
    useLayoutEffect(() => {
        const shell = shellRef.current;
        const navigation = navigationRef.current;
        if (!shell || !navigation)
            return;
        let frame = 0;
        let focusTarget = null;
        let endClearance = 0;
        const clearEndSpace = () => {
            if (endClearance) {
                shell.style.removeProperty("--od-application-focus-clearance");
                endClearance = 0;
            }
        };
        const keepFocusVisible = () => {
            frame = 0;
            const active = document.activeElement;
            const navigationBox = navigation.getBoundingClientRect();
            if (active !== focusTarget) {
                clearEndSpace();
                focusTarget = active;
            }
            if (!(active instanceof Element) ||
                !shell.contains(active) ||
                navigation.contains(active) ||
                active.closest("dialog[open]") ||
                document.querySelector(":modal") ||
                active.getClientRects().length === 0 ||
                navigationBox.height === 0) {
                clearEndSpace();
                return;
            }
            // Dialogs and fixed panels own their local focus and scroll position.
            let bounded = /(hidden|clip)/.test(getComputedStyle(shell).overflowY);
            for (let parent = active; parent && parent !== shell; parent = parent.parentElement) {
                const parentStyle = getComputedStyle(parent);
                if (parentStyle.position === "fixed") {
                    clearEndSpace();
                    return;
                }
                bounded ||=
                    parent !== active && /(hidden|clip)/.test(parentStyle.overflowY);
            }
            const style = getComputedStyle(active);
            const outline = Math.max(0, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset));
            const clearance = Math.max(5, outline);
            const offset = () => {
                const box = active.getBoundingClientRect();
                return Math.max(0, Math.min(box.bottom + clearance - navigationBox.top, box.top - clearance));
            };
            // Keep native focus ownership. Use only the space needed to expose it.
            for (let parent = active.parentElement; parent && offset() > 0; parent = parent.parentElement) {
                if (parent === document.scrollingElement) {
                    // An unbounded page can end at its last control. Reserve only the
                    // missing scroll range; bounded full-page routes keep their size.
                    const remaining = parent.scrollHeight - parent.clientHeight - parent.scrollTop;
                    const boundedPage = bounded &&
                        parent.scrollHeight <= parent.clientHeight + endClearance + 1;
                    if (boundedPage)
                        clearEndSpace();
                    if (!boundedPage && offset() > remaining) {
                        endClearance += Math.ceil(offset() - remaining);
                        shell.style.setProperty("--od-application-focus-clearance", `${String(endClearance)}px`);
                    }
                    parent.scrollBy({ top: offset(), behavior: "instant" });
                    break;
                }
                if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) {
                    const available = active.getBoundingClientRect().top -
                        parent.getBoundingClientRect().top -
                        parent.clientTop -
                        clearance;
                    parent.scrollBy({
                        top: Math.max(0, Math.min(offset(), available)),
                        behavior: "instant",
                    });
                }
            }
        };
        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(keepFocusVisible);
        };
        const measure = () => {
            shell.style.setProperty("--od-application-navigation-height", `${String(navigation.getBoundingClientRect().height)}px`);
            schedule();
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(navigation);
        observer.observe(shell);
        shell.addEventListener("focusin", schedule);
        shell.addEventListener("focusout", schedule);
        window.addEventListener("resize", schedule);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            shell.removeEventListener("focusin", schedule);
            shell.removeEventListener("focusout", schedule);
            window.removeEventListener("resize", schedule);
            clearEndSpace();
        };
    }, []);
    const { className: mainClassName, ...restMainProps } = mainProps ?? {};
    return (_jsxs("div", { ...props, ref: shellRef, className: ["od-application-shell", className].filter(Boolean).join(" "), children: [sidebar, _jsxs("div", { className: "od-application-column", children: [topbar, _jsx("main", { ...restMainProps, className: ["od-application-main", mainClassName]
                            .filter(Boolean)
                            .join(" "), children: children })] }), _jsx("div", { className: "od-application-mobile-navigation", ref: navigationRef, children: mobileNavigation })] }));
}
/** A sticky sidebar with slots for host-owned brand, context, and navigation. */
export function ApplicationSidebar({ brand, className, context, footer, navigation, ...props }) {
    return (_jsxs("aside", { ...props, className: ["od-application-sidebar", className]
            .filter(Boolean)
            .join(" "), children: [_jsx("div", { className: "od-application-sidebar-brand", children: brand }), context ? (_jsx("div", { className: "od-application-sidebar-context", children: context })) : null, _jsx("div", { className: "od-application-sidebar-navigation", children: navigation }), footer ? (_jsx("footer", { className: "od-application-sidebar-footer", children: footer })) : null] }));
}
/** A responsive application header with caller-owned title and actions. */
export function ApplicationTopbar({ actions, className, leading, title, ...props }) {
    return (_jsxs("header", { ...props, className: ["od-application-topbar", className].filter(Boolean).join(" "), children: [leading ? (_jsx("div", { className: "od-application-topbar-leading", children: leading })) : null, _jsx("div", { className: "od-application-topbar-title", children: title }), actions ? (_jsx("div", { className: "od-application-topbar-actions", children: actions })) : null] }));
}
/** A scrollable navigation boundary for grouped application destinations. */
export function ApplicationNavigation({ children, className, ...props }) {
    return (_jsx("nav", { ...props, className: ["od-application-navigation", className]
            .filter(Boolean)
            .join(" "), children: children }));
}
/** A labelled group inside the primary application navigation. */
export function ApplicationNavigationGroup({ children, className, label, "aria-labelledby": labelledBy, ...props }) {
    const generatedLabelId = useId();
    return (_jsxs("section", { ...props, "aria-labelledby": labelledBy ?? generatedLabelId, className: ["od-application-navigation-group", className]
            .filter(Boolean)
            .join(" "), children: [_jsx("p", { className: "od-application-navigation-label", id: labelledBy === undefined ? generatedLabelId : undefined, children: label }), _jsx("div", { className: "od-application-navigation-items", children: children })] }));
}
//# sourceMappingURL=ApplicationShell.js.map