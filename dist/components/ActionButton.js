import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useLayoutEffect, useRef, } from "react";
/** An action with a stable name and content that fits its allocated width. */
export function ActionButton({ label, icon, variant = "secondary", className, type = "button", ref, ...props }) {
    const buttonRef = useRef(null);
    const iconRef = useRef(null);
    const labelRef = useRef(null);
    const setButtonRef = useCallback((button) => {
        buttonRef.current = button;
        if (typeof ref === "function")
            return ref(button);
        if (ref)
            ref.current = button;
    }, [ref]);
    useLayoutEffect(() => {
        const button = buttonRef.current;
        const iconElement = iconRef.current;
        const labelElement = labelRef.current;
        const view = button?.ownerDocument.defaultView;
        if (!button || !iconElement || !labelElement || !view)
            return;
        function measure() {
            if (!button || !iconElement || !labelElement || !view)
                return;
            const style = view.getComputedStyle(button);
            const available = button.clientWidth -
                parseFloat(style.paddingLeft) -
                parseFloat(style.paddingRight);
            if (available <= 0)
                return;
            const labelWidth = labelElement.getBoundingClientRect().width;
            const iconWidth = iconElement.getBoundingClientRect().width;
            const gap = parseFloat(style.columnGap) || 0;
            button.dataset.presentation =
                available >= labelWidth + iconWidth + gap
                    ? "full"
                    : available >= labelWidth
                        ? "text"
                        : "icon";
        }
        const observer = typeof ResizeObserver === "undefined"
            ? null
            : new ResizeObserver(measure);
        observer?.observe(button);
        observer?.observe(iconElement);
        observer?.observe(labelElement);
        const fonts = button.ownerDocument.fonts;
        let active = true;
        fonts?.addEventListener("loadingdone", measure);
        void fonts?.ready.then(() => {
            if (active)
                measure();
        });
        view.addEventListener("resize", measure);
        measure();
        return () => {
            active = false;
            observer?.disconnect();
            fonts?.removeEventListener("loadingdone", measure);
            view.removeEventListener("resize", measure);
        };
    }, [label, icon, className, variant]);
    return (_jsxs("button", { ...props, ref: setButtonRef, type: type, "aria-label": props["aria-label"] ?? label, title: props.title ?? label, className: [
            "od-button",
            `od-button-${variant}`,
            "od-action-button",
            className,
        ]
            .filter(Boolean)
            .join(" "), children: [_jsx("span", { ref: iconRef, className: "od-action-button-icon", "aria-hidden": "true", children: icon }), _jsx("span", { ref: labelRef, className: "od-action-button-label", "aria-hidden": "true", children: label })] }));
}
/** One full-width row with equal space and a minimum touch target per action. */
export function ActionButtonGroup({ className, ...props }) {
    return (_jsx("fieldset", { ...props, className: ["od-action-button-group", className]
            .filter(Boolean)
            .join(" ") }));
}
//# sourceMappingURL=ActionButton.js.map